import { ObjectId } from 'mongodb';
import { getCollection } from '../config/database';
import { ParameterDocument } from '../models/Parameter';

/**
 * Seed script for the 8 standard hematology parameters from SRS 2.6
 * Run this script once to populate the parameters collection
 */

const SYSTEM_USER_ID = new ObjectId('000000000000000000000000'); // System user for seed data

const parameters: Omit<ParameterDocument, '_id'>[] = [
  {
    parameter_code: 'WBC',
    parameter_name: 'White Blood Cell Count',
    abbreviation: 'WBC',
    unit: 'cells/μL',
    description: 'Measures the number of white blood cells (leukocytes) in the blood, which helps fight infection.',
    normal_range: {
      min: 4000,
      max: 10000,
      text: '4,000–10,000 cells/μL'
    },
    is_active: true,
    created_at: new Date(),
    created_by: SYSTEM_USER_ID,
    updated_at: new Date(),
    updated_by: SYSTEM_USER_ID
  },
  {
    parameter_code: 'RBC',
    parameter_name: 'Red Blood Cell Count',
    abbreviation: 'RBC',
    unit: 'million/μL',
    description: 'Measures the number of red blood cells per unit of blood, which are responsible for carrying oxygen throughout the body.',
    normal_range: {
      male: { min: 4.7, max: 6.1, text: 'Male: 4.7–6.1 million/μL' },
      female: { min: 4.2, max: 5.4, text: 'Female: 4.2–5.4 million/μL' }
    },
    is_active: true,
    created_at: new Date(),
    created_by: SYSTEM_USER_ID,
    updated_at: new Date(),
    updated_by: SYSTEM_USER_ID
  },
  {
    parameter_code: 'HGB',
    parameter_name: 'Hemoglobin',
    abbreviation: 'Hb/HGB',
    unit: 'g/dL',
    description: 'Measures the amount of hemoglobin in the blood, which is the protein in red blood cells that carries oxygen.',
    normal_range: {
      male: { min: 14, max: 18, text: 'Male: 14–18 g/dL' },
      female: { min: 12, max: 16, text: 'Female: 12–16 g/dL' }
    },
    is_active: true,
    created_at: new Date(),
    created_by: SYSTEM_USER_ID,
    updated_at: new Date(),
    updated_by: SYSTEM_USER_ID
  },
  {
    parameter_code: 'HCT',
    parameter_name: 'Hematocrit',
    abbreviation: 'HCT',
    unit: '%',
    description: 'Represents the percentage of red blood cells in the blood volume, indicating oxygen-carrying capacity.',
    normal_range: {
      male: { min: 42, max: 52, text: 'Male: 42–52%' },
      female: { min: 37, max: 47, text: 'Female: 37–47%' }
    },
    is_active: true,
    created_at: new Date(),
    created_by: SYSTEM_USER_ID,
    updated_at: new Date(),
    updated_by: SYSTEM_USER_ID
  },
  {
    parameter_code: 'PLT',
    parameter_name: 'Platelet Count',
    abbreviation: 'PLT',
    unit: 'cells/μL',
    description: 'Measures the number of platelets in the blood, which are responsible for clotting.',
    normal_range: {
      min: 150000,
      max: 350000,
      text: '150,000–350,000 cells/μL'
    },
    is_active: true,
    created_at: new Date(),
    created_by: SYSTEM_USER_ID,
    updated_at: new Date(),
    updated_by: SYSTEM_USER_ID
  },
  {
    parameter_code: 'MCV',
    parameter_name: 'Mean Corpuscular Volume',
    abbreviation: 'MCV',
    unit: 'fL',
    description: 'Indicates the average size of red blood cells.',
    normal_range: {
      min: 80,
      max: 100,
      text: '80–100 fL'
    },
    is_active: true,
    created_at: new Date(),
    created_by: SYSTEM_USER_ID,
    updated_at: new Date(),
    updated_by: SYSTEM_USER_ID
  },
  {
    parameter_code: 'MCH',
    parameter_name: 'Mean Corpuscular Haemoglobin',
    abbreviation: 'MCH',
    unit: 'pg',
    description: 'Represents the average amount of haemoglobin per red blood cell.',
    normal_range: {
      min: 27,
      max: 33,
      text: '27–33 pg'
    },
    is_active: true,
    created_at: new Date(),
    created_by: SYSTEM_USER_ID,
    updated_at: new Date(),
    updated_by: SYSTEM_USER_ID
  },
  {
    parameter_code: 'MCHC',
    parameter_name: 'Mean Corpuscular Haemoglobin Concentration',
    abbreviation: 'MCHC',
    unit: 'g/dL',
    description: 'Calculates the average concentration of haemoglobin in red blood cells.',
    normal_range: {
      min: 32,
      max: 36,
      text: '32–36 g/dL'
    },
    is_active: true,
    created_at: new Date(),
    created_by: SYSTEM_USER_ID,
    updated_at: new Date(),
    updated_by: SYSTEM_USER_ID
  }
];

export const seedParameters = async (): Promise<void> => {
  try {
    console.log('🌱 Starting parameter seeding...');
    
    const collection = getCollection<ParameterDocument>('parameters');
    
    // Check if parameters already exist
    const existingCount = await collection.countDocuments();
    if (existingCount > 0) {
      console.log(`⚠️  Parameters already exist (${existingCount} found). Skipping seed.`);
      console.log('To re-seed, delete the parameters collection first.');
      return;
    }
    
    // Insert parameters
    const result = await collection.insertMany(parameters as ParameterDocument[]);
    
    console.log(`✅ Successfully seeded ${result.insertedCount} parameters:`);
    parameters.forEach(param => {
      console.log(`   - ${param.parameter_code}: ${param.parameter_name}`);
    });
    
  } catch (error) {
    console.error('❌ Error seeding parameters:', error);
    throw error;
  }
};

// Run seed if executed directly
if (require.main === module) {
  const { connectDB } = require('../config/database');
  
  connectDB()
    .then(async () => {
      await seedParameters();
      console.log('✨ Parameter seeding completed!');
      process.exit(0);
    })
    .catch((error: Error) => {
      console.error('❌ Failed to seed parameters:', error);
      process.exit(1);
    });
}

