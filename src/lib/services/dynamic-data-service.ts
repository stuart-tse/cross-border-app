import { ListType, ContentType } from '@prisma/client';

export interface DynamicListItem {
  id: string;
  key: string;
  label: string;
  value?: string;
  description?: string;
  icon?: string;
  color?: string;
  sortOrder: number;
  isActive: boolean;
  isDefault: boolean;
  metadata?: any;
  children?: DynamicListItem[];
}

export interface ContentItem {
  id: string;
  key: string;
  title: string;
  content?: string;
  metadata?: any;
  locale: string;
}

export interface AppSetting {
  id: string;
  section: string;
  key: string;
  value: string;
  parsedValue: any;
  type: string;
  description?: string;
}

/**
 * Service for loading dynamic data from the API
 * Provides caching and fallback to hardcoded values during migration
 */
export class DynamicDataService {
  private static cache = new Map<string, any>();
  private static cacheTimeout = 5 * 60 * 1000; // 5 minutes
  private static cacheTimestamps = new Map<string, number>();

  /**
   * Get list items by type with caching
   */
  static async getListItems(
    listType: ListType, 
    locale: string = 'en',
    useCache: boolean = true
  ): Promise<DynamicListItem[]> {
    const cacheKey = `list_${listType}_${locale}`;
    
    // Check cache first
    if (useCache && this.isValidCache(cacheKey)) {
      return this.cache.get(cacheKey) || [];
    }

    try {
      const response = await fetch(`/api/admin/lists?listType=${listType}&locale=${locale}`);
      const data = await response.json();

      if (data.success && data.data) {
        const items = data.data.map((item: any) => ({
          id: item.id,
          key: item.key,
          label: item.label,
          value: item.value,
          description: item.description,
          icon: item.icon,
          color: item.color,
          sortOrder: item.sortOrder,
          isActive: item.isActive,
          isDefault: item.isDefault,
          metadata: item.metadata,
          children: item.children || [],
        }));

        // Cache the result
        this.cache.set(cacheKey, items);
        this.cacheTimestamps.set(cacheKey, Date.now());

        return items;
      }
    } catch (error) {
      console.error(`Error fetching list items for ${listType}:`, error);
    }

    // Fallback to hardcoded values during migration
    return this.getFallbackListItems(listType);
  }

  /**
   * Get content by key
   */
  static async getContent(
    key: string,
    locale: string = 'en',
    useCache: boolean = true
  ): Promise<ContentItem | null> {
    const cacheKey = `content_${key}_${locale}`;
    
    // Check cache first
    if (useCache && this.isValidCache(cacheKey)) {
      return this.cache.get(cacheKey) || null;
    }

    try {
      const response = await fetch(`/api/admin/content?key=${key}&locale=${locale}`);
      const data = await response.json();

      if (data.success && data.data && data.data.length > 0) {
        const item = data.data[0];
        const contentItem = {
          id: item.id,
          key: item.key,
          title: item.title,
          content: item.content,
          metadata: item.metadata,
          locale: item.locale,
        };

        // Cache the result
        this.cache.set(cacheKey, contentItem);
        this.cacheTimestamps.set(cacheKey, Date.now());

        return contentItem;
      }
    } catch (error) {
      console.error(`Error fetching content for ${key}:`, error);
    }

    return null;
  }

  /**
   * Get app settings by section
   */
  static async getSettings(
    section: string,
    environment: string = 'production',
    useCache: boolean = true
  ): Promise<AppSetting[]> {
    const cacheKey = `settings_${section}_${environment}`;
    
    // Check cache first
    if (useCache && this.isValidCache(cacheKey)) {
      return this.cache.get(cacheKey) || [];
    }

    try {
      const response = await fetch(`/api/admin/app-settings?section=${section}&environment=${environment}`);
      const data = await response.json();

      if (data.success && data.data) {
        const settings = data.data.map((setting: any) => ({
          id: setting.id,
          section: setting.section,
          key: setting.key,
          value: setting.value,
          parsedValue: setting.parsedValue,
          type: setting.type,
          description: setting.description,
        }));

        // Cache the result
        this.cache.set(cacheKey, settings);
        this.cacheTimestamps.set(cacheKey, Date.now());

        return settings;
      }
    } catch (error) {
      console.error(`Error fetching settings for ${section}:`, error);
    }

    return [];
  }

  /**
   * Get a specific setting value
   */
  static async getSetting(
    section: string,
    key: string,
    defaultValue: any = null,
    environment: string = 'production'
  ): Promise<any> {
    const settings = await this.getSettings(section, environment);
    const setting = settings.find(s => s.key === key);
    return setting ? setting.parsedValue : defaultValue;
  }

  /**
   * Clear cache for a specific key or all cache
   */
  static clearCache(key?: string): void {
    if (key) {
      this.cache.delete(key);
      this.cacheTimestamps.delete(key);
    } else {
      this.cache.clear();
      this.cacheTimestamps.clear();
    }
  }

  /**
   * Check if cache is valid
   */
  private static isValidCache(key: string): boolean {
    const timestamp = this.cacheTimestamps.get(key);
    if (!timestamp || !this.cache.has(key)) return false;
    return Date.now() - timestamp < this.cacheTimeout;
  }

  /**
   * Fallback hardcoded values during migration
   */
  private static getFallbackListItems(listType: ListType): DynamicListItem[] {
    const fallbacks: Record<ListType, DynamicListItem[]> = {
      VEHICLE_FEATURES: [
        { id: '1', key: 'air_conditioning', label: 'Air Conditioning', sortOrder: 0, isActive: true, isDefault: false },
        { id: '2', key: 'wifi', label: 'WiFi', sortOrder: 1, isActive: true, isDefault: false },
        { id: '3', key: 'gps_navigation', label: 'GPS Navigation', sortOrder: 2, isActive: true, isDefault: false },
        { id: '4', key: 'bluetooth', label: 'Bluetooth', sortOrder: 3, isActive: true, isDefault: false },
        { id: '5', key: 'usb_charging', label: 'USB Charging', sortOrder: 4, isActive: true, isDefault: false },
        { id: '6', key: 'premium_sound', label: 'Premium Sound', sortOrder: 5, isActive: true, isDefault: false },
        { id: '7', key: 'leather_seats', label: 'Leather Seats', sortOrder: 6, isActive: true, isDefault: false },
        { id: '8', key: 'tinted_windows', label: 'Tinted Windows', sortOrder: 7, isActive: true, isDefault: false },
      ],
      SPECIAL_EQUIPMENT: [
        { id: '1', key: 'child_safety_seats', label: 'Child Safety Seats', sortOrder: 0, isActive: true, isDefault: false },
        { id: '2', key: 'wheelchair_access', label: 'Wheelchair Access', sortOrder: 1, isActive: true, isDefault: false },
        { id: '3', key: 'cargo_barrier', label: 'Cargo Barrier', sortOrder: 2, isActive: true, isDefault: false },
        { id: '4', key: 'security_camera', label: 'Security Camera', sortOrder: 3, isActive: true, isDefault: false },
        { id: '5', key: 'first_aid_kit', label: 'First Aid Kit', sortOrder: 4, isActive: true, isDefault: false },
        { id: '6', key: 'fire_extinguisher', label: 'Fire Extinguisher', sortOrder: 5, isActive: true, isDefault: false },
      ],
      COLORS: [
        { id: '1', key: 'black', label: 'Black', color: '#000000', sortOrder: 0, isActive: true, isDefault: false },
        { id: '2', key: 'white', label: 'White', color: '#FFFFFF', sortOrder: 1, isActive: true, isDefault: true },
        { id: '3', key: 'silver', label: 'Silver', color: '#C0C0C0', sortOrder: 2, isActive: true, isDefault: false },
        { id: '4', key: 'gray', label: 'Gray', color: '#808080', sortOrder: 3, isActive: true, isDefault: false },
        { id: '5', key: 'blue', label: 'Blue', color: '#0000FF', sortOrder: 4, isActive: true, isDefault: false },
        { id: '6', key: 'red', label: 'Red', color: '#FF0000', sortOrder: 5, isActive: true, isDefault: false },
        { id: '7', key: 'green', label: 'Green', color: '#008000', sortOrder: 6, isActive: true, isDefault: false },
        { id: '8', key: 'gold', label: 'Gold', color: '#FFD700', sortOrder: 7, isActive: true, isDefault: false },
        { id: '9', key: 'brown', label: 'Brown', color: '#A52A2A', sortOrder: 8, isActive: true, isDefault: false },
        { id: '10', key: 'other', label: 'Other', sortOrder: 9, isActive: true, isDefault: false },
      ],
      FUEL_TYPES: [
        { id: '1', key: 'gasoline', label: 'Gasoline', sortOrder: 0, isActive: true, isDefault: true },
        { id: '2', key: 'diesel', label: 'Diesel', sortOrder: 1, isActive: true, isDefault: false },
        { id: '3', key: 'hybrid', label: 'Hybrid', sortOrder: 2, isActive: true, isDefault: false },
        { id: '4', key: 'electric', label: 'Electric', sortOrder: 3, isActive: true, isDefault: false },
        { id: '5', key: 'cng', label: 'CNG', sortOrder: 4, isActive: true, isDefault: false },
        { id: '6', key: 'lpg', label: 'LPG', sortOrder: 5, isActive: true, isDefault: false },
      ],
      // Add more fallbacks as needed
      VEHICLE_MAKES: [],
      VEHICLE_MODELS: [],
      COUNTRIES: [],
      CITIES: [],
      LANGUAGES: [],
      CURRENCIES: [],
      DOCUMENT_TYPES: [],
      NOTIFICATION_TYPES: [],
      SUPPORT_CATEGORIES: [],
      PAYMENT_METHODS: [],
    };

    return fallbacks[listType] || [];
  }

  /**
   * Convert list items to format expected by components
   */
  static listItemsToOptions(items: DynamicListItem[]): { value: string; label: string; [key: string]: any }[] {
    return items
      .filter(item => item.isActive)
      .sort((a, b) => a.sortOrder - b.sortOrder)
      .map(item => ({
        value: item.value || item.key,
        label: item.label,
        key: item.key,
        icon: item.icon,
        color: item.color,
        description: item.description,
        isDefault: item.isDefault,
        metadata: item.metadata,
      }));
  }

  /**
   * Get default option from list items
   */
  static getDefaultOption(items: DynamicListItem[]): DynamicListItem | null {
    const defaultItem = items.find(item => item.isDefault && item.isActive);
    return defaultItem || (items.find(item => item.isActive) || null);
  }
}

export default DynamicDataService;