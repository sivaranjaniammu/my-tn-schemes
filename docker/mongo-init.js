// ============================================================
//  MongoDB Initialization Script
//  Runs once when the MongoDB container is first created.
//  Creates the app database user with limited privileges.
// ============================================================

db = db.getSiblingDB('tn-scheme-bot');

// Create an application-level user (least-privilege principle)
db.createUser({
    user: 'tnschemeapp',
    pwd: 'tnschemeapppwd',   // Override via MONGO_APP_USER/MONGO_APP_PASS env vars in production
    roles: [
        { role: 'readWrite', db: 'tn-scheme-bot' }
    ]
});

// Create initial indexes for performance
db.categories.createIndex({ id: 1 }, { unique: true });
db.schemes.createIndex({ categoryId: 1 });
db.schemes.createIndex({
    scheme_name_en: 'text',
    scheme_name_ta: 'text',
    description_en: 'text',
    description_ta: 'text'
});
db.users.createIndex({ email: 1 }, { unique: true });

print('✅ MongoDB tn-scheme-bot database initialized with indexes and app user.');
