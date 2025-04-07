import { CircleDollarSign, Leaf, PlusCircle } from 'lucide-react'

type Item = {
  name: string
  quantity: number
  brand: string
  country: string
  organic: boolean
  lowestPrice: boolean
}

interface ItemInputProps {
  addItem: () => void
  handleUpdateItem: (
    field: keyof Item,
    value: string | number | boolean
  ) => void
  tempItem: {
    name: string
    quantity: number
    brand: string
    country: string
    organic: boolean
    lowestPrice: boolean
  }
}

const ItemInput: React.FC<ItemInputProps> = ({
  addItem,
  handleUpdateItem,
  tempItem,
}) => {
  return (
    <div className="bg-white rounded-xl shadow-lg p-6 mb-8 transition-all duration-300 hover:shadow-xl">
      <h2 className="text-xl font-semibold mb-4 text-gray-800">Add New Item</h2>

      <div className="space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <input
            value={tempItem.name}
            onChange={(e) => handleUpdateItem('name', e.target.value)}
            placeholder="Product name *"
            className="w-full px-4 py-2 rounded-lg border border-gray-200 focus:ring-2 focus:ring-green-500 focus:border-transparent outline-none transition-all duration-200"
          />

          <input
            type="number"
            min={1}
            value={tempItem.quantity}
            onChange={(e) =>
              handleUpdateItem('quantity', Number(e.target.value))
            }
            placeholder="Quantity"
            className="w-full px-4 py-2 rounded-lg border border-gray-200 focus:ring-2 focus:ring-green-500 focus:border-transparent outline-none transition-all duration-200"
          />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <input
            value={tempItem.brand}
            onChange={(e) => handleUpdateItem('brand', e.target.value)}
            placeholder="Preferred brand"
            className="w-full px-4 py-2 rounded-lg border border-gray-200 focus:ring-2 focus:ring-green-500 focus:border-transparent outline-none transition-all duration-200"
          />

          <input
            value={tempItem.country}
            onChange={(e) => handleUpdateItem('country', e.target.value)}
            placeholder="Country of origin"
            className="w-full px-4 py-2 rounded-lg border border-gray-200 focus:ring-2 focus:ring-green-500 focus:border-transparent outline-none transition-all duration-200"
          />
        </div>

        <div className="flex flex-wrap gap-4">
          <label className="flex items-center space-x-2 text-gray-700 cursor-pointer">
            <input
              type="checkbox"
              checked={tempItem.organic}
              onChange={(e) => handleUpdateItem('organic', e.target.checked)}
              className="rounded text-green-500 focus:ring-green-500 cursor-pointer"
            />
            <span className="flex items-center">
              <Leaf className="w-4 h-4 mr-1 text-green-500" />
              Organic
            </span>
          </label>

          <label className="flex items-center space-x-2 text-gray-700 cursor-pointer">
            <input
              type="checkbox"
              checked={tempItem.lowestPrice}
              onChange={(e) =>
                handleUpdateItem('lowestPrice', e.target.checked)
              }
              className="rounded text-green-500 focus:ring-green-500 cursor-pointer"
            />
            <span className="flex items-center">
              <CircleDollarSign className="w-4 h-4 mr-1 text-orange-500" />
              Lowest Price
            </span>
          </label>
        </div>

        <button
          onClick={addItem}
          disabled={!tempItem.name}
          className="w-full bg-green-500 text-white px-6 py-3 rounded-lg font-medium flex items-center justify-center space-x-2 hover:bg-green-600 transition-colors duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          <PlusCircle className="w-5 h-5" />
          <span>Add to List</span>
        </button>
      </div>
    </div>
  )
}

export default ItemInput
