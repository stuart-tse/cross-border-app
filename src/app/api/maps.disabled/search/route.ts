import { NextRequest, NextResponse } from 'next/server';

// Amap (Gaode Maps) API integration for location search
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const query = searchParams.get('q');
    const region = searchParams.get('region') || 'ALL'; // HK, CHINA, or ALL
    
    if (!query) {
      return NextResponse.json(
        { error: 'Query parameter is required' },
        { status: 400 }
      );
    }

    // Mock Amap API response for development
    // In production, you would call the actual Amap API
    const mockResults = generateMockLocationResults(query, region);

    return NextResponse.json({
      suggestions: mockResults,
      count: mockResults.length,
    });
  } catch (error) {
    console.error('Maps search error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

// Mock function - replace with actual Amap API call
function generateMockLocationResults(query: string, region: string) {
  const mockLocations = [
    // Hong Kong locations
    {
      id: 'hk_001',
      name: 'Hong Kong International Airport',
      address: '1 Sky Plaza Rd, Chek Lap Kok, Hong Kong',
      district: 'Islands',
      region: 'HK',
      lat: 22.3080,
      lng: 113.9185,
      type: 'airport',
      icon: '✈️',
    },
    {
      id: 'hk_002', 
      name: 'Central Station',
      address: 'Central, Hong Kong Island, Hong Kong',
      district: 'Central and Western',
      region: 'HK',
      lat: 22.2819,
      lng: 114.1577,
      type: 'transit',
      icon: '🚇',
    },
    {
      id: 'hk_003',
      name: 'Tsim Sha Tsui',
      address: 'Tsim Sha Tsui, Kowloon, Hong Kong',
      district: 'Yau Tsim Mong',
      region: 'HK',
      lat: 22.2976,
      lng: 114.1722,
      type: 'district',
      icon: '🏙️',
    },
    {
      id: 'hk_004',
      name: 'Hong Kong-Zhuhai-Macao Bridge Hong Kong Port',
      address: 'Lantau Island, Hong Kong',
      district: 'Islands',
      region: 'HK',
      lat: 22.3069,
      lng: 113.9463,
      type: 'border',
      icon: '🌉',
    },
    // China locations
    {
      id: 'cn_001',
      name: 'Shenzhen Bao\'an International Airport',
      address: 'Bao\'an District, Shenzhen, Guangdong, China',
      district: 'Bao\'an',
      region: 'CHINA',
      lat: 22.6329,
      lng: 113.8108,
      type: 'airport',
      icon: '✈️',
    },
    {
      id: 'cn_002',
      name: 'Luohu Port',
      address: 'Luohu District, Shenzhen, Guangdong, China',
      district: 'Luohu',
      region: 'CHINA',
      lat: 22.5260,
      lng: 114.1133,
      type: 'border',
      icon: '🛂',
    },
    {
      id: 'cn_003',
      name: 'Futian Port',
      address: 'Futian District, Shenzhen, Guangdong, China',
      district: 'Futian',
      region: 'CHINA',
      lat: 22.5168,
      lng: 114.0658,
      type: 'border',
      icon: '🛂',
    },
    {
      id: 'cn_004',
      name: 'Guangzhou South Railway Station',
      address: 'Panyu District, Guangzhou, Guangdong, China',
      district: 'Panyu',
      region: 'CHINA',
      lat: 22.9889,
      lng: 113.2644,
      type: 'transit',
      icon: '🚄',
    },
    {
      id: 'cn_005',
      name: 'Shenzhen North Station',
      address: 'Longhua District, Shenzhen, Guangdong, China',
      district: 'Longhua',
      region: 'CHINA',
      lat: 22.6103,
      lng: 114.0298,
      type: 'transit',
      icon: '🚄',
    },
  ];

  // Filter by region
  let filteredLocations = mockLocations;
  if (region !== 'ALL') {
    filteredLocations = mockLocations.filter(loc => loc.region === region);
  }

  // Filter by query
  const queryLower = query.toLowerCase();
  return filteredLocations
    .filter(location => 
      location.name.toLowerCase().includes(queryLower) ||
      location.address.toLowerCase().includes(queryLower) ||
      location.district.toLowerCase().includes(queryLower)
    )
    .map(location => ({
      ...location,
      relevance: calculateRelevance(location, queryLower),
    }))
    .sort((a, b) => b.relevance - a.relevance)
    .slice(0, 10); // Return top 10 results
}

function calculateRelevance(location: any, query: string): number {
  let score = 0;
  
  // Exact name match gets highest score
  if (location.name.toLowerCase() === query) {
    score += 100;
  } else if (location.name.toLowerCase().startsWith(query)) {
    score += 80;
  } else if (location.name.toLowerCase().includes(query)) {
    score += 60;
  }
  
  // Address match
  if (location.address.toLowerCase().includes(query)) {
    score += 40;
  }
  
  // District match
  if (location.district.toLowerCase().includes(query)) {
    score += 30;
  }
  
  // Boost important locations
  if (location.type === 'airport') score += 20;
  if (location.type === 'border') score += 15;
  if (location.type === 'transit') score += 10;
  
  return score;
}