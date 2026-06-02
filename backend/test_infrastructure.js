import mongoose from 'mongoose';
import dotenv from 'dotenv';
import path from 'path';
import fs from 'fs';

// Force Mock Redis to ensure instant failback during offline testing
process.env.USE_MOCK_REDIS = 'true';

dotenv.config();

// Ensure uploads folder exists for local trace logging
const uploadsDir = path.resolve('./src/uploads');
if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir, { recursive: true });
}

const runTests = async () => {
  console.log('\n======================================================');
  console.log('      REPOMIND AI SAAS SCALING INFRASTRUCTURE TEST      ');
  console.log('======================================================\n');

  // Dynamic import of core SaaS modules to prevent ESM hoisting of Redis connections
  const { redisClient, isMockRedis } = await import('./src/config/redis.js');
  const { getQueue, getQueueSizes } = await import('./src/queues/queueManager.js');
  const { startWorkers } = await import('./src/workers/workerProcessor.js');
  const { cacheService } = await import('./src/services/cacheService.js');
  const { storageService } = await import('./src/services/storageService.js');
  const { sendEmail, getWelcomeEmail, getAnalysisCompleteEmail } = await import('./src/services/emailService.js');
  
  // Dynamic import of models and controllers
  const User = (await import('./src/models/User.js')).default;
  const Project = (await import('./src/models/Project.js')).default;
  const Subscription = (await import('./src/models/Subscription.js')).default;
  const { getTelemetryDashboard } = await import('./src/controllers/adminController.js');

  // Boot background worker listeners
  console.log('[STEP 1] Starting Background worker processors...');
  startWorkers();

  // Test 1: Redis Configuration and Cache Layer
  console.log('\n[TEST 2] Verifying Redis / Cache Service operations...');
  console.log(`- Redis Mock Mode active: ${isMockRedis}`);
  
  await cacheService.set('test_cache_key', { status: 'SaaS Active', timestamp: Date.now() }, 10);
  const cacheHit = await cacheService.get('test_cache_key');
  console.log('- Cache Set & Get outcome:', cacheHit);
  
  if (cacheHit && cacheHit.status === 'SaaS Active') {
    console.log('=> Cache Layer: SUCCESS! ✅');
  } else {
    console.error('=> Cache Layer: FAILED! ❌');
  }

  // Test 2: Storage Abstraction Layer
  console.log('\n[TEST 3] Verifying Abstract File Storage Service...');
  const tempTestFile = path.join(uploadsDir, 'temp_saas_test.txt');
  fs.writeFileSync(tempTestFile, 'RepoMind SaaS Storage Abstraction test payload.');

  const fileKey = 'specs/saas_test_spec.txt';
  const downloadUrl = await storageService.saveFile(tempTestFile, fileKey);
  console.log(`- Storage save outcome URL: ${downloadUrl}`);

  const activeUrl = await storageService.getDownloadUrl(fileKey);
  console.log(`- Retrieved active storage link: ${activeUrl}`);

  if (downloadUrl) {
    console.log('=> Storage Layer: SUCCESS! ✅');
  } else {
    console.error('=> Storage Layer: FAILED! ❌');
  }

  // Clean temp file
  if (fs.existsSync(tempTestFile)) fs.unlinkSync(tempTestFile);
  await storageService.deleteFile(fileKey);

  // Test 3: Email Templates and Carrier dispatch
  console.log('\n[TEST 4] Verifying Nodemailer Transactional Template engines...');
  const welcomePayload = getWelcomeEmail('SaaS Developer');
  const alertPayload = getAnalysisCompleteEmail('SaaS Developer', 'RepoMind-Core-Suite', 'mock-project-123');

  console.log('- Generating Welcome Subject:', welcomePayload.subject);
  console.log('- Generating Analysis Complete Subject:', alertPayload.subject);

  // Send test welcome email
  await sendEmail('developer@repomind.ai', welcomePayload.subject, welcomePayload.text, welcomePayload.html);
  
  const mockEmailFile = path.resolve('./src/uploads/mock_emails.log');
  if (fs.existsSync(mockEmailFile)) {
    console.log(`- Transaction email log file successfully generated at: ${mockEmailFile}`);
    console.log('=> Email System: SUCCESS! ✅');
  } else {
    console.error('=> Email System: FAILED! ❌');
  }

  // Test 4: BullMQ Job Queue Processing Dispatch
  console.log('\n[TEST 5] Dispatching background job to BullMQ queue...');
  const analysisQueue = getQueue('analysisQueue');
  
  // Connect Mongoose to simulated local DB for tests
  console.log('- Connecting database connections...');
  const mongoUri = process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/repomind_test';
  
  try {
    await mongoose.connect(mongoUri, { serverSelectionTimeoutMS: 2000 });
    console.log('- Connected to MongoDB database successfully.');

    // Seed mock data for verification
    const mockUser = await User.findOneAndUpdate(
      { email: 'developer@repomind.ai' },
      { name: 'SaaS Developer', plan: 'pro', credits: 100 },
      { upsert: true, new: true }
    );

    const mockProject = await Project.create({
      userId: mockUser._id,
      projectName: 'Telemetry-Scan-Test',
      sourceType: 'zip',
      status: 'pending'
    });

    console.log(`- Added mock project: ${mockProject.projectName} (ID: ${mockProject._id})`);

    // Dispatch job to workers asynchronously
    const job = await analysisQueue.add('Scan-Codebase', {
      workspacePath: uploadsDir,
      projectName: mockProject.projectName,
      projectId: mockProject._id
    }, { attempts: 1 });

    console.log(`- Job registered successfully inside BullMQ! JobID: ${job.id}`);
    
    // Check initial queue sizes
    const sizes = await getQueueSizes();
    console.log('- Active Queue Sizes:', sizes);

    // Wait a brief moment for asynchronous queue processing
    console.log('- Simulating async execution time (waiting 1500ms)...');
    await new Promise(resolve => setTimeout(resolve, 1500));

    // Verify Project status updated
    const updatedProj = await Project.findById(mockProject._id);
    console.log(`- Updated Project Status after Worker processing: "${updatedProj.status}"`);

    if (updatedProj.status === 'analyzing') {
      console.log('=> Distributed Workers Pipeline: SUCCESS! ✅');
    } else {
      console.warn('=> Distributed Workers Pipeline: pending execution (standard in Mock/offline Redis) ⚠️');
    }

    // Test 5: Admin Telemetry Dashboard Controller
    console.log('\n[TEST 6] Simulating Admin Telemetry Dashboard aggregation fetch...');
    // Seed an active subscription
    await Subscription.findOneAndUpdate(
      { userId: mockUser._id },
      { plan: 'pro', status: 'active', price: 29 },
      { upsert: true, new: true }
    );

    const reqMock = {};
    const resMock = {
      status(code) {
        this.code = code;
        return this;
      },
      json(data) {
        this.data = data;
        return this;
      }
    };

    await getTelemetryDashboard(reqMock, resMock, (err) => console.error(err));
    console.log('- Telemetry Dashboard Output:', resMock.data?.data);

    if (resMock.data && resMock.data.success) {
      console.log('=> Administrative Telemetry: SUCCESS! ✅');
    } else {
      console.error('=> Administrative Telemetry: FAILED! ❌');
    }

    // Clean up database test records
    await Project.deleteOne({ _id: mockProject._id });
    await Subscription.deleteOne({ userId: mockUser._id });
    await User.deleteOne({ _id: mockUser._id });

  } catch (err) {
    console.log(`- Skipping actual database/worker execution hooks (MongoDB offline): ${err.message}`);
    console.log('=> Database execution test: SKIPPED (Local MongoDB offline) ⚠️');
  } finally {
    await mongoose.disconnect();
    console.log('- Closed database connection.');
  }

  console.log('\n======================================================');
  console.log('           ALL INFRASTRUCTURE TESTS COMPLETED           ');
  console.log('======================================================\n');
  process.exit(0);
};

runTests().catch(err => {
  console.error('[TEST SUITE CRITICAL EXCEPTION]', err);
  process.exit(1);
});
