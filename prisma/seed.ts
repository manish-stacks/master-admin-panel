import { PrismaClient, Role, PostStatus, LeadStatus, RedirectType } from '@prisma/client'
import bcrypt from 'bcryptjs'

const prisma = new PrismaClient()

async function main() {
  console.log('🌱 Seeding database...')

  // Create Super Admin
  const hashedPassword = await bcrypt.hash('Admin@123', 12)
  const admin = await prisma.user.upsert({
    where: { email: 'admin@example.com' },
    update: {},
    create: {
      email: 'admin@example.com',
      password: hashedPassword,
      name: 'Super Admin',
      role: Role.SUPER_ADMIN,
      isActive: true,
    },
  })
  console.log('✅ Admin user created:', admin.email)

  // Create Editor user
  const editorPassword = await bcrypt.hash('Editor@123', 12)
  await prisma.user.upsert({
    where: { email: 'editor@example.com' },
    update: {},
    create: {
      email: 'editor@example.com',
      password: editorPassword,
      name: 'Content Editor',
      role: Role.EDITOR,
      isActive: true,
    },
  })

  // Create SEO Manager
  await prisma.user.upsert({
    where: { email: 'seo@example.com' },
    update: {},
    create: {
      email: 'seo@example.com',
      password: editorPassword,
      name: 'SEO Manager',
      role: Role.SEO_MANAGER,
      isActive: true,
    },
  })
  console.log('✅ Additional users created')

  // Create Categories
  const devCategory = await prisma.category.upsert({
    where: { slug: 'development' },
    update: {},
    create: { name: 'Development', slug: 'development', description: 'Web development articles' },
  })
  const seoCategory = await prisma.category.upsert({
    where: { slug: 'seo' },
    update: {},
    create: { name: 'SEO', slug: 'seo', description: 'SEO tips and strategies' },
  })
  const securityCategory = await prisma.category.upsert({
    where: { slug: 'security' },
    update: {},
    create: { name: 'Security', slug: 'security', description: 'Web security best practices' },
  })
  console.log('✅ Categories created')

  // Create Tags
  await prisma.tag.upsert({ where: { slug: 'nextjs' }, update: {}, create: { name: 'Next.js', slug: 'nextjs' } })
  await prisma.tag.upsert({ where: { slug: 'prisma' }, update: {}, create: { name: 'Prisma', slug: 'prisma' } })
  await prisma.tag.upsert({ where: { slug: 'mysql' }, update: {}, create: { name: 'MySQL', slug: 'mysql' } })
  await prisma.tag.upsert({ where: { slug: 'tailwindcss' }, update: {}, create: { name: 'Tailwind CSS', slug: 'tailwindcss' } })
  console.log('✅ Tags created')

  // Create Pages
  const homepage = await prisma.page.upsert({
    where: { slug: '/' },
    update: {},
    create: {
      title: 'Homepage',
      slug: '/',
      content: '<h1>Welcome to NexusCMS</h1><p>A powerful, SEO-first headless CMS built on Next.js.</p>',
      status: PostStatus.PUBLISHED,
      authorId: admin.id,
      publishedAt: new Date(),
    },
  })
  await prisma.seoMeta.upsert({
    where: { pageId: homepage.id },
    update: {},
    create: {
      pageId: homepage.id,
      metaTitle: 'NexusCMS — SEO-First Headless CMS for Next.js',
      metaDescription: 'A powerful, SEO-first headless CMS built on Next.js with Prisma and MySQL. Manage pages, blogs, leads, and more.',
      ogTitle: 'NexusCMS — Headless CMS',
      noIndex: false,
    },
  })

  await prisma.page.upsert({
    where: { slug: 'about-us' },
    update: {},
    create: {
      title: 'About Us',
      slug: 'about-us',
      content: '<h1>About NexusCMS</h1><p>We build powerful CMS solutions for modern web projects.</p>',
      status: PostStatus.PUBLISHED,
      authorId: admin.id,
      publishedAt: new Date(),
    },
  })

  await prisma.page.upsert({
    where: { slug: 'services' },
    update: {},
    create: {
      title: 'Services',
      slug: 'services',
      content: '<h1>Our Services</h1><p>Web development, SEO, and content management solutions.</p>',
      status: PostStatus.PUBLISHED,
      authorId: admin.id,
      publishedAt: new Date(),
    },
  })

  await prisma.page.upsert({
    where: { slug: 'contact' },
    update: {},
    create: {
      title: 'Contact',
      slug: 'contact',
      content: '<h1>Contact Us</h1><p>Get in touch with our team.</p>',
      status: PostStatus.PUBLISHED,
      authorId: admin.id,
      publishedAt: new Date(),
    },
  })
  console.log('✅ Pages created')

  // Create Blogs
  await prisma.blog.upsert({
    where: { slug: 'building-scalable-apis-nextjs-14' },
    update: {},
    create: {
      title: 'Building Scalable APIs with Next.js 14',
      slug: 'building-scalable-apis-nextjs-14',
      excerpt: 'Learn how to build production-grade APIs using Next.js 14 App Router and server actions.',
      content: '<h1>Building Scalable APIs with Next.js 14</h1><p>Next.js 14 introduces powerful new features for building APIs...</p>',
      status: PostStatus.PUBLISHED,
      authorId: admin.id,
      viewCount: 1247,
      publishedAt: new Date(),
      categories: { connect: [{ id: devCategory.id }] },
    },
  })

  await prisma.blog.upsert({
    where: { slug: 'prisma-orm-migrations-deep-dive' },
    update: {},
    create: {
      title: 'Prisma ORM: Migrations Deep Dive',
      slug: 'prisma-orm-migrations-deep-dive',
      excerpt: 'A comprehensive guide to Prisma migrations, schema management, and best practices.',
      content: '<h1>Prisma ORM: Migrations Deep Dive</h1><p>Prisma makes database schema management simple and type-safe...</p>',
      status: PostStatus.PUBLISHED,
      authorId: admin.id,
      viewCount: 847,
      publishedAt: new Date(Date.now() - 86400000),
      categories: { connect: [{ id: devCategory.id }] },
    },
  })

  await prisma.blog.upsert({
    where: { slug: 'core-web-vitals-optimization' },
    update: {},
    create: {
      title: 'Core Web Vitals Optimization Guide',
      slug: 'core-web-vitals-optimization',
      excerpt: 'Improve your site\'s Core Web Vitals score with these proven optimization techniques.',
      content: '<h1>Core Web Vitals Optimization</h1><p>Core Web Vitals are essential metrics for measuring user experience...</p>',
      status: PostStatus.DRAFT,
      authorId: admin.id,
      categories: { connect: [{ id: seoCategory.id }] },
    },
  })
  console.log('✅ Blogs created')

  // Create Leads
  await prisma.lead.createMany({
    skipDuplicates: true,
    data: [
      { name: 'Ravi Kumar', email: 'ravi@example.in', phone: '+91 98765 43210', subject: 'Web Development', message: 'Interested in web development services for my startup.', status: LeadStatus.NEW },
      { name: 'Priya Sharma', email: 'priya@startup.io', phone: '+91 87654 32109', subject: 'CMS Development', message: 'Need a custom CMS for our e-commerce site.', status: LeadStatus.NEW },
      { name: 'John Mitchell', email: 'j.mitchell@corp.com', subject: 'Enterprise CMS', message: 'Looking for enterprise CMS pricing and features.', status: LeadStatus.CONTACTED },
      { name: 'Anita Desai', email: 'anita@agency.co', subject: 'White Label', message: 'White-label reseller inquiry for our agency.', status: LeadStatus.CLOSED },
    ],
  })
  console.log('✅ Leads created')

  // Create Redirects
  await prisma.redirect.createMany({
    skipDuplicates: true,
    data: [
      { fromPath: '/old-blog', toPath: '/blog', type: RedirectType.PERMANENT_301 },
      { fromPath: '/about', toPath: '/about-us', type: RedirectType.PERMANENT_301 },
      { fromPath: '/promo', toPath: '/sale-2026', type: RedirectType.TEMPORARY_302 },
      { fromPath: '/services/design', toPath: '/services/web-design', type: RedirectType.PERMANENT_301 },
    ],
  })
  console.log('✅ Redirects created')

  // Create Settings
  const defaultSettings = [
    { key: 'site_name', value: 'NexusCMS', group: 'general' },
    { key: 'site_url', value: 'https://yourdomain.com', group: 'general' },
    { key: 'site_description', value: 'A powerful SEO-first headless CMS built on Next.js', group: 'general' },
    { key: 'default_meta_title', value: 'NexusCMS — Headless CMS for Next.js', group: 'seo' },
    { key: 'default_meta_description', value: 'A powerful, SEO-first headless CMS built on Next.js with Prisma and MySQL.', group: 'seo' },
    { key: 'robots_txt', value: 'User-agent: *\nAllow: /\nDisallow: /admin\nDisallow: /api\n\nSitemap: https://yourdomain.com/sitemap.xml', group: 'seo' },
    { key: 'smtp_host', value: 'smtp.gmail.com', group: 'email' },
    { key: 'smtp_port', value: '587', group: 'email' },
    { key: 'smtp_from', value: 'noreply@yourdomain.com', group: 'email' },
    { key: 'social_twitter', value: 'https://twitter.com/yourhandle', group: 'social' },
    { key: 'social_linkedin', value: 'https://linkedin.com/company/yourcompany', group: 'social' },
    { key: 'cloudinary_cloud_name', value: '', group: 'integrations' },
    { key: 'google_analytics_id', value: '', group: 'integrations' },
    { key: 'header_scripts', value: '', group: 'scripts' },
    { key: 'footer_scripts', value: '', group: 'scripts' },
  ]

  for (const setting of defaultSettings) {
    await prisma.setting.upsert({
      where: { key: setting.key },
      update: {},
      create: setting,
    })
  }
  console.log('✅ Settings created')

  console.log('\n🎉 Database seeded successfully!')
  console.log('\n📋 Default Login Credentials:')
  console.log('   Super Admin → admin@example.com / Admin@123')
  console.log('   Editor      → editor@example.com / Editor@123')
  console.log('   SEO Manager → seo@example.com / Editor@123')
}

main()
  .catch((e) => {
    console.error('❌ Seed failed:', e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
