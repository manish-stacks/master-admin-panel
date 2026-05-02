export type UserRole = 'SUPER_ADMIN' | 'ADMIN' | 'EDITOR' | 'SEO_MANAGER'
export type PostStatus = 'DRAFT' | 'PUBLISHED' | 'SCHEDULED' | 'ARCHIVED'
export type LeadStatus = 'NEW' | 'CONTACTED' | 'CLOSED'
export type RedirectType = 'PERMANENT_301' | 'TEMPORARY_302'

export interface User {
  id: string
  email: string
  name: string
  role: UserRole
  avatar?: string
  createdAt: Date
}

export interface Page {
  id: string
  title: string
  slug: string
  content: string
  status: PostStatus
  author: { name: string }
  seoMeta?: SeoMeta
  publishedAt?: Date
  updatedAt: Date
}

export interface Blog {
  id: string
  title: string
  slug: string
  excerpt?: string
  content: string
  featuredImage?: string
  status: PostStatus
  author: { name: string }
  categories: Category[]
  tags: Tag[]
  seoMeta?: SeoMeta
  viewCount: number
  publishedAt?: Date
  updatedAt: Date
}

export interface SeoMeta {
  metaTitle?: string
  metaDescription?: string
  keywords?: string
  ogTitle?: string
  ogDescription?: string
  ogImage?: string
  canonicalUrl?: string
  noIndex: boolean
  noFollow: boolean
  jsonLd?: string
}

export interface Category {
  id: string
  name: string
  slug: string
}

export interface Tag {
  id: string
  name: string
  slug: string
}

export interface Lead {
  id: string
  name: string
  email: string
  phone?: string
  subject?: string
  message: string
  status: LeadStatus
  createdAt: Date
}

export interface Media {
  id: string
  filename: string
  url: string
  mimeType: string
  size: number
  width?: number
  height?: number
  altText?: string
  createdAt: Date
}

export interface Redirect {
  id: string
  fromPath: string
  toPath: string
  type: RedirectType
  isActive: boolean
  hitCount: number
  createdAt: Date
}

export interface ActivityLog {
  id: string
  user: { name: string }
  action: string
  entity: string
  details?: string
  createdAt: Date
}

export interface ApiResponse<T = unknown> {
  success: boolean
  data?: T
  error?: string
  message?: string
}

export interface PaginatedResponse<T> {
  data: T[]
  total: number
  page: number
  limit: number
  totalPages: number
}
