import { PrismaClient } from '@prisma/client'
import bcrypt from 'bcryptjs'

const prisma = new PrismaClient()

async function main() {
  console.log('🌱 Starting database seeding...')

  // Create admin user
  const adminPassword = await bcrypt.hash('admin123', 12)
  const admin = await prisma.user.upsert({
    where: { email: 'admin@marketplace.com' },
    update: {},
    create: {
      email: 'admin@marketplace.com',
      name: 'Admin User',
      password: adminPassword,
      role: 'ADMIN'
    }
  })
  console.log('✅ Admin user created:', admin.email)

  // Create sample customer
  const customerPassword = await bcrypt.hash('customer123', 12)
  const customer = await prisma.user.upsert({
    where: { email: 'customer@example.com' },
    update: {},
    create: {
      email: 'customer@example.com',
      name: 'John Customer',
      password: customerPassword,
      role: 'CUSTOMER',
      customer: {
        create: {}
      }
    }
  })
  console.log('✅ Sample customer created:', customer.email)

  // Create sample vendor
  const vendorPassword = await bcrypt.hash('vendor123', 12)
  const vendor = await prisma.user.upsert({
    where: { email: 'vendor@example.com' },
    update: {},
    create: {
      email: 'vendor@example.com',
      name: 'Jane Vendor',
      password: vendorPassword,
      role: 'VENDOR',
      vendor: {
        create: {
          storeName: "Jane's Electronics Store",
          storeSlug: 'janes-electronics-store',
          description: 'Quality electronics and gadgets for everyone',
          isApproved: true,
          isActive: true
        }
      }
    }
  })
  console.log('✅ Sample vendor created:', vendor.email)

  // Create categories
  const categories = [
    {
      name: 'Electronics',
      slug: 'electronics',
      description: 'Computers, phones, and electronic devices',
      children: [
        { name: 'Smartphones', slug: 'smartphones', description: 'Mobile phones and accessories' },
        { name: 'Laptops', slug: 'laptops', description: 'Portable computers and notebooks' },
        { name: 'Tablets', slug: 'tablets', description: 'Tablet computers and e-readers' }
      ]
    },
    {
      name: 'Fashion',
      slug: 'fashion',
      description: 'Clothing, shoes, and accessories',
      children: [
        { name: 'Men\'s Clothing', slug: 'mens-clothing', description: 'Clothing for men' },
        { name: 'Women\'s Clothing', slug: 'womens-clothing', description: 'Clothing for women' },
        { name: 'Shoes', slug: 'shoes', description: 'Footwear for all occasions' }
      ]
    },
    {
      name: 'Home & Garden',
      slug: 'home-garden',
      description: 'Home improvement and garden supplies',
      children: [
        { name: 'Furniture', slug: 'furniture', description: 'Home and office furniture' },
        { name: 'Kitchen', slug: 'kitchen', description: 'Kitchen appliances and tools' },
        { name: 'Garden', slug: 'garden', description: 'Gardening tools and supplies' }
      ]
    },
    {
      name: 'Sports & Outdoors',
      slug: 'sports-outdoors',
      description: 'Sports equipment and outdoor gear',
      children: [
        { name: 'Fitness', slug: 'fitness', description: 'Exercise equipment and gear' },
        { name: 'Outdoor Recreation', slug: 'outdoor-recreation', description: 'Camping and hiking gear' }
      ]
    },
    {
      name: 'Books & Media',
      slug: 'books-media',
      description: 'Books, movies, music, and games',
      children: [
        { name: 'Books', slug: 'books', description: 'Physical and digital books' },
        { name: 'Movies & TV', slug: 'movies-tv', description: 'DVDs, Blu-rays, and digital media' }
      ]
    },
    {
      name: 'Health & Beauty',
      slug: 'health-beauty',
      description: 'Health products and beauty supplies',
      children: [
        { name: 'Skincare', slug: 'skincare', description: 'Skincare products and treatments' },
        { name: 'Makeup', slug: 'makeup', description: 'Cosmetics and beauty tools' }
      ]
    }
  ]

  for (const categoryData of categories) {
    const { children, ...parentData } = categoryData
    
    const parentCategory = await prisma.category.upsert({
      where: { slug: parentData.slug },
      update: {},
      create: {
        ...parentData,
        sortOrder: categories.indexOf(categoryData)
      }
    })

    console.log('✅ Category created:', parentCategory.name)

    // Create child categories
    if (children) {
      for (const childData of children) {
        const childCategory = await prisma.category.upsert({
          where: { slug: childData.slug },
          update: {},
          create: {
            ...childData,
            parentId: parentCategory.id,
            sortOrder: children.indexOf(childData)
          }
        })
        console.log('  ✅ Subcategory created:', childCategory.name)
      }
    }
  }

  // Get the vendor we created
  const vendorRecord = await prisma.vendor.findFirst({
    where: { user: { email: 'vendor@example.com' } }
  })

  if (vendorRecord) {
    // Get some categories for products
    const electronicsCategory = await prisma.category.findUnique({
      where: { slug: 'smartphones' }
    })
    const fashionCategory = await prisma.category.findUnique({
      where: { slug: 'mens-clothing' }
    })

    // Create sample products
    const sampleProducts = [
      {
        title: 'iPhone 15 Pro',
        slug: 'iphone-15-pro',
        description: 'The latest iPhone with advanced features and stunning design. Features include A17 Pro chip, titanium design, and advanced camera system.',
        shortDescription: 'Latest iPhone with A17 Pro chip and titanium design',
        price: 999.99,
        compareAtPrice: 1099.99,
        categoryId: electronicsCategory?.id || '',
        inventory: 50,
        isFeatured: true,
        tags: JSON.stringify(['smartphone', 'apple', 'iphone', 'mobile']),
        images: JSON.stringify(['/images/iphone-15-pro.jpg'])
      },
      {
        title: 'Samsung Galaxy S24',
        slug: 'samsung-galaxy-s24',
        description: 'Powerful Android smartphone with excellent camera and performance. Features Snapdragon processor and AI-enhanced photography.',
        shortDescription: 'Powerful Android smartphone with AI features',
        price: 799.99,
        compareAtPrice: 899.99,
        categoryId: electronicsCategory?.id || '',
        inventory: 30,
        isFeatured: true,
        tags: JSON.stringify(['smartphone', 'samsung', 'android', 'mobile']),
        images: JSON.stringify(['/images/samsung-s24.jpg'])
      },
      {
        title: 'Men\'s Cotton T-Shirt',
        slug: 'mens-cotton-tshirt',
        description: 'Comfortable 100% cotton t-shirt perfect for everyday wear. Available in multiple colors and sizes.',
        shortDescription: '100% cotton t-shirt for everyday comfort',
        price: 24.99,
        compareAtPrice: 34.99,
        categoryId: fashionCategory?.id || '',
        inventory: 100,
        isFeatured: false,
        tags: JSON.stringify(['clothing', 'tshirt', 'cotton', 'casual']),
        images: JSON.stringify(['/images/cotton-tshirt.jpg'])
      }
    ]

    for (const productData of sampleProducts) {
      if (productData.categoryId) {
        const product = await prisma.product.upsert({
          where: { slug: productData.slug },
          update: {},
          create: {
            ...productData,
            vendorId: vendorRecord.id
          }
        })
        console.log('✅ Product created:', product.title)
      }
    }
  }

  // Create some settings
  const settings = [
    { key: 'site_name', value: 'Multi-Vendor Marketplace', type: 'string' },
    { key: 'site_description', value: 'A modern multi-vendor e-commerce platform', type: 'string' },
    { key: 'default_commission', value: '0.1', type: 'number' },
    { key: 'currency', value: 'USD', type: 'string' },
    { key: 'tax_rate', value: '0.08', type: 'number' },
    { key: 'shipping_rate', value: '9.99', type: 'number' }
  ]

  for (const setting of settings) {
    await prisma.setting.upsert({
      where: { key: setting.key },
      update: {},
      create: setting
    })
  }
  console.log('✅ Settings created')

  console.log('🎉 Database seeding completed!')
  console.log('\n📋 Test Accounts:')
  console.log('Admin: admin@marketplace.com / admin123')
  console.log('Customer: customer@example.com / customer123')
  console.log('Vendor: vendor@example.com / vendor123')
}

main()
  .catch((e) => {
    console.error('❌ Seeding failed:', e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
