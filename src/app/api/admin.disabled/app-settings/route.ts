import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { SettingType } from '@prisma/client';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const section = searchParams.get('section');
    const key = searchParams.get('key');
    const environment = searchParams.get('environment') || 'production';

    let where: any = {
      environment,
      isActive: true,
    };

    if (section) where.section = section;
    if (key) where.key = key;

    const settings = await prisma.appSetting.findMany({
      where,
      orderBy: [
        { section: 'asc' },
        { key: 'asc' },
      ],
    });

    // Parse JSON values and return typed values
    const parsedSettings = settings.map(setting => ({
      ...setting,
      parsedValue: parseSettingValue(setting.value, setting.type),
    }));

    return NextResponse.json({
      success: true,
      data: parsedSettings,
    });
  } catch (error) {
    console.error('Error fetching settings:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to fetch settings' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const {
      section,
      key,
      value,
      type,
      description,
      validation,
      environment = 'production',
      isActive = true,
      isEncrypted = false,
      createdBy,
    } = body;

    // Serialize value based on type
    const serializedValue = serializeSettingValue(value, type);

    const setting = await prisma.appSetting.create({
      data: {
        section,
        key,
        value: serializedValue,
        type,
        description,
        validation,
        environment,
        isActive,
        isEncrypted,
        createdBy,
        updatedBy: createdBy,
      },
    });

    return NextResponse.json({
      success: true,
      data: {
        ...setting,
        parsedValue: parseSettingValue(setting.value, setting.type),
      },
    });
  } catch (error) {
    console.error('Error creating setting:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to create setting' },
      { status: 500 }
    );
  }
}

// Helper functions
function parseSettingValue(value: string, type: SettingType): any {
  try {
    switch (type) {
      case 'STRING':
      case 'EMAIL':
      case 'URL':
      case 'PASSWORD':
      case 'TEXT':
        return value;
      case 'NUMBER':
        return parseFloat(value);
      case 'BOOLEAN':
        return value === 'true' || value === '1';
      case 'JSON':
        return JSON.parse(value);
      default:
        return value;
    }
  } catch (error) {
    console.error('Error parsing setting value:', error);
    return value;
  }
}

function serializeSettingValue(value: any, type: SettingType): string {
  try {
    switch (type) {
      case 'STRING':
      case 'EMAIL':
      case 'URL':
      case 'PASSWORD':
      case 'TEXT':
        return String(value);
      case 'NUMBER':
        return String(value);
      case 'BOOLEAN':
        return String(!!value);
      case 'JSON':
        return JSON.stringify(value);
      default:
        return String(value);
    }
  } catch (error) {
    console.error('Error serializing setting value:', error);
    return String(value);
  }
}