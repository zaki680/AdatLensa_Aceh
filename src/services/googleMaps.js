import { importLibrary, setOptions } from '@googlemaps/js-api-loader';

const ATTRIBUTION_ID = 'gmp_mcp_codeassist_v1_aistudio';

let loaderInitialized = false;
const regionSearchCache = new Map();

function getMapsApiKey() {
  const viteKey = import.meta.env?.VITE_GOOGLE_MAPS_API_KEY || '';
  const definedKey =
    typeof __GOOGLE_MAPS_API_KEY__ !== 'undefined' ? __GOOGLE_MAPS_API_KEY__ : '';
  return viteKey || definedKey;
}

function isQuotaError(err) {
  const msg = String(err?.message || err || '').toUpperCase();
  const code = err?.code || err?.status;
  return (
    code === 429 ||
    msg.includes('RESOURCE_EXHAUSTED') ||
    msg.includes('OVER_QUERY_LIMIT') ||
    msg.includes('OVERQUOTAMAPERROR') ||
    msg.includes('QUOTAEXCEEDEDERROR') ||
    msg.includes('QUOTA')
  );
}

function notifyQuotaExceeded() {
  window.dispatchEvent(new CustomEvent('gmp-quota-exceeded'));
}

function buildInfoWindowContent(place, spotMeta) {
  const wrapper = document.createElement('div');
  wrapper.style.maxWidth = '260px';
  wrapper.style.fontFamily = 'var(--font-body)';
  wrapper.style.lineHeight = '1.45';

  const titleEl = document.createElement('div');
  titleEl.style.fontWeight = '700';
  titleEl.style.fontSize = '0.94rem';
  titleEl.style.color = '#064e3b';
  titleEl.style.marginBottom = '4px';
  titleEl.textContent = place.displayName || spotMeta?.nama || 'Lokasi Aceh';
  wrapper.appendChild(titleEl);

  if (place.formattedAddress) {
    const addrEl = document.createElement('div');
    addrEl.style.fontSize = '0.78rem';
    addrEl.style.color = '#42544d';
    addrEl.style.marginBottom = '6px';
    addrEl.textContent = place.formattedAddress;
    wrapper.appendChild(addrEl);
  }

  if (spotMeta?.fasilitasIbadah) {
    const worshipEl = document.createElement('div');
    worshipEl.style.fontSize = '0.76rem';
    worshipEl.style.color = '#047857';
    worshipEl.style.marginBottom = '6px';
    worshipEl.textContent = spotMeta.fasilitasIbadah;
    wrapper.appendChild(worshipEl);
  }

  if (place.googleMapsURI) {
    const linkEl = document.createElement('a');
    linkEl.href = place.googleMapsURI;
    linkEl.target = '_blank';
    linkEl.rel = 'noopener noreferrer';
    linkEl.style.fontSize = '0.78rem';
    linkEl.style.fontWeight = '700';
    linkEl.style.color = '#0f766e';
    linkEl.style.textDecoration = 'none';
    linkEl.textContent = 'Buka di Google Maps ↗';
    wrapper.appendChild(linkEl);
  }

  if (Array.isArray(place.attributions) && place.attributions.length > 0) {
    const attrEl = document.createElement('div');
    attrEl.style.marginTop = '6px';
    attrEl.style.fontSize = '0.68rem';
    attrEl.style.color = '#64746e';
    attrEl.textContent = place.attributions.map((a) => a.provider).filter(Boolean).join(', ');
    wrapper.appendChild(attrEl);
  }

  return wrapper;
}

export async function createAcehMapController(containerEl, lang = 'id') {
  const apiKey = getMapsApiKey();
  if (!apiKey) {
    throw new Error('MISSING_MAPS_API_KEY');
  }

  if (!loaderInitialized) {
    setOptions({
      key: apiKey,
      v: 'weekly',
      language: lang === 'en' ? 'en' : 'id',
      region: 'ID',
    });
    loaderInitialized = true;
  }

  let libs;
  try {
    libs = await Promise.all([
      importLibrary('maps'),
      importLibrary('marker'),
      importLibrary('places'),
      importLibrary('core'),
    ]);
  } catch (err) {
    if (isQuotaError(err)) notifyQuotaExceeded();
    throw err;
  }

  const [{ Map, InfoWindow }, { AdvancedMarkerElement, PinElement }, { Place }, { LatLngBounds }] = libs;

  let map = null;
  let infoWindow = new InfoWindow({ maxWidth: 280 });
  let activeMarkers = [];

  function clearMarkers() {
    activeMarkers.forEach((m) => {
      m.map = null;
    });
    activeMarkers = [];
  }

  function ensureMap(centerLoc) {
    if (map) return map;
    map = new Map(containerEl, {
      center: centerLoc,
      zoom: 12,
      mapId: 'DEMO_MAP_ID',
      gestureHandling: 'cooperative',
      mapTypeControl: true,
      streetViewControl: true,
      fullscreenControl: true,
      internalUsageAttributionIds: [ATTRIBUTION_ID],
    });
    return map;
  }

  async function searchRegionPlaces(regionName, spotsInRegion) {
    const cacheKey = `${lang}::${regionName}::${spotsInRegion.map((s) => s.id).join(',')}`;
    if (regionSearchCache.has(cacheKey)) {
      return regionSearchCache.get(cacheKey);
    }

    const queries =
      spotsInRegion.length > 0
        ? spotsInRegion.map((spot) => ({
            query: `${spot.nama}, ${regionName}, Aceh, Indonesia`,
            spotMeta: spot,
          }))
        : [{ query: `${regionName}, Aceh, Indonesia`, spotMeta: null }];

    const results = [];
    for (const item of queries) {
      try {
        const { places } = await Place.searchByText({
          textQuery: item.query,
          fields: ['id', 'displayName', 'location', 'formattedAddress', 'googleMapsURI', 'viewport'],
          maxResultCount: 1,
          language: lang === 'en' ? 'en' : 'id',
          region: 'ID',
          internalUsageAttributionIds: [ATTRIBUTION_ID],
        });
        if (places && places.length > 0 && places[0].location) {
          results.push({ place: places[0], spotMeta: item.spotMeta });
        }
      } catch (err) {
        if (isQuotaError(err)) {
          notifyQuotaExceeded();
          throw err;
        }
      }
    }

    if (results.length === 0) {
      try {
        const { places } = await Place.searchByText({
          textQuery: `${regionName}, Aceh, Indonesia`,
          fields: ['id', 'displayName', 'location', 'formattedAddress', 'googleMapsURI', 'viewport'],
          maxResultCount: 1,
          language: lang === 'en' ? 'en' : 'id',
          region: 'ID',
          internalUsageAttributionIds: [ATTRIBUTION_ID],
        });
        if (places && places.length > 0 && places[0].location) {
          results.push({ place: places[0], spotMeta: null });
        }
      } catch (err) {
        if (isQuotaError(err)) {
          notifyQuotaExceeded();
          throw err;
        }
      }
    }

    if (results.length > 0) {
      regionSearchCache.set(cacheKey, results);
    }
    return results;
  }

  function renderMarkers(entries) {
    clearMarkers();
    if (!entries.length) return;

    const firstLoc = entries[0].place.location;
    const mapInstance = ensureMap(firstLoc);
    const bounds = new LatLngBounds();

    entries.forEach((entry, index) => {
      const { place, spotMeta } = entry;
      if (!place.location) return;

      const pin = new PinElement({
        background: '#064e3b',
        borderColor: '#f59e0b',
        glyphColor: '#fef3c7',
        glyphText: String(index + 1),
        scale: 1.05,
      });

      const marker = new AdvancedMarkerElement({
        map: mapInstance,
        position: place.location,
        title: place.displayName || spotMeta?.nama || 'Aceh',
      });
      marker.append(pin);

      marker.addListener('click', () => {
        mapInstance.panTo(place.location);
        infoWindow.close();
        infoWindow.setContent(buildInfoWindowContent(place, spotMeta));
        infoWindow.open({
          map: mapInstance,
          anchor: marker,
          shouldFocus: false,
        });
      });

      activeMarkers.push(marker);
      bounds.extend(place.location);
    });

    if (entries.length === 1) {
      if (entries[0].place.viewport) {
        mapInstance.fitBounds(entries[0].place.viewport);
      } else {
        mapInstance.setCenter(entries[0].place.location);
        mapInstance.setZoom(13);
      }
    } else {
      mapInstance.fitBounds(bounds, { top: 48, right: 48, bottom: 48, left: 48 });
    }

    // Open infoWindow on primary marker
    if (activeMarkers[0]) {
      infoWindow.close();
      infoWindow.setContent(buildInfoWindowContent(entries[0].place, entries[0].spotMeta));
      infoWindow.open({
        map: mapInstance,
        anchor: activeMarkers[0],
        shouldFocus: false,
      });
    }
  }

  async function focusRegion(regionName, spotsInRegion) {
    const entries = await searchRegionPlaces(regionName, spotsInRegion);
    renderMarkers(entries);
    return entries;
  }

  async function searchCustomPlace(queryText) {
    const clean = queryText.trim();
    if (!clean) return [];
    try {
      const { places } = await Place.searchByText({
        textQuery: `${clean}, Aceh, Indonesia`,
        fields: ['id', 'displayName', 'location', 'formattedAddress', 'googleMapsURI', 'viewport'],
        maxResultCount: 5,
        language: lang === 'en' ? 'en' : 'id',
        region: 'ID',
        internalUsageAttributionIds: [ATTRIBUTION_ID],
      });
      const entries = (places || [])
        .filter((p) => p.location)
        .map((p) => ({ place: p, spotMeta: null }));
      if (entries.length > 0) {
        renderMarkers(entries);
      }
      return entries;
    } catch (err) {
      if (isQuotaError(err)) {
        notifyQuotaExceeded();
      }
      throw err;
    }
  }

  return {
    focusRegion,
    searchCustomPlace,
    destroy() {
      clearMarkers();
      if (infoWindow) infoWindow.close();
    },
  };
}
