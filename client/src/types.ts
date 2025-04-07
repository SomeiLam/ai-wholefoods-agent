export type GroceryItem = {
  name: string
  quantity: number
  preferences: {
    brand?: string
    organic?: boolean
    country?: string
    lowestPrice?: boolean
  }
}

export type Result = {
  item: GroceryItem
  status: 'added' | 'skipped' | 'not_added' | 'error'
  reason?: string
  productName?: string
  href?: string
  price?: string
  suggestions?: string[]
}
