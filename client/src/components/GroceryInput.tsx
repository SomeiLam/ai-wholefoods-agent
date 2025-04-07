import { useState } from 'react';
import axios from 'axios';
import { PlusCircle, ShoppingCart, Brain, X, ChevronRight, Leaf } from 'lucide-react';

type GroceryItem = {
  name: string;
  quantity: number;
  preferences: {
    brand?: string;
    organic?: boolean;
    country?: string;
    lowestPrice?: boolean;
  };
};

type Result = {
  name: string;
  quantity: number;
  status: 'added' | 'failed';
  reason?: string;
  suggestions?: string[];
}

export const GroceryInput = () => {
  const [items, setItems] = useState<GroceryItem[]>([]);
  const [name, setName] = useState('');
  const [quantity, setQuantity] = useState(1);
  const [organic, setOrganic] = useState(false);
  const [brand, setBrand] = useState('');
  const [country, setCountry] = useState('');
  const [lowestPrice, setLowestPrice] = useState(false);
  const [result, setResult] = useState<Result[]>([]);

  const addItem = () => {
    if (!name || quantity < 1) return;

    const newItem: GroceryItem = {
      name,
      quantity,
      preferences: {
        organic,
        brand: brand || undefined,
        country: country || undefined,
        lowestPrice,
      },
    };

    setItems([...items, newItem]);

    // Reset form
    setName('');
    setQuantity(1);
    setOrganic(false);
    setBrand('');
    setCountry('');
    setLowestPrice(false);
  };

  const removeItem = (index: number) => {
    setItems((prev) => prev.filter((_, i) => i !== index));
  };

  const submitItems = async () => {
    setResult([])
    const res = await axios.post('http://localhost:4000/api/submit-groceries', { items });
    setResult(res.data.result);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 to-blue-50">
      <div className="max-w-2xl mx-auto p-6">
        <header className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-800 mb-2">
            <ShoppingCart className="inline-block mr-2 mb-1" size={32} />
            Smart Grocery Assistant
          </h1>
          <p className="text-gray-600">Let AI help you shop smarter at Whole Foods</p>
        </header>

        <div className="bg-white rounded-xl shadow-lg p-6 mb-8 transition-all duration-300 hover:shadow-xl">
          <h2 className="text-xl font-semibold mb-4 text-gray-800">Add New Item</h2>
          
          <div className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <input
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Product name *"
                className="w-full px-4 py-2 rounded-lg border border-gray-200 focus:ring-2 focus:ring-green-500 focus:border-transparent outline-none transition-all duration-200"
              />
              
              <input
                type="number"
                min={1}
                value={quantity}
                onChange={(e) => setQuantity(Number(e.target.value))}
                placeholder="Quantity"
                className="w-full px-4 py-2 rounded-lg border border-gray-200 focus:ring-2 focus:ring-green-500 focus:border-transparent outline-none transition-all duration-200"
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <input
                value={brand}
                onChange={(e) => setBrand(e.target.value)}
                placeholder="Preferred brand"
                className="w-full px-4 py-2 rounded-lg border border-gray-200 focus:ring-2 focus:ring-green-500 focus:border-transparent outline-none transition-all duration-200"
              />
              
              <input
                value={country}
                onChange={(e) => setCountry(e.target.value)}
                placeholder="Country of origin"
                className="w-full px-4 py-2 rounded-lg border border-gray-200 focus:ring-2 focus:ring-green-500 focus:border-transparent outline-none transition-all duration-200"
              />
            </div>

            <div className="flex flex-wrap gap-4">
              <label className="flex items-center space-x-2 text-gray-700 cursor-pointer">
                <input
                  type="checkbox"
                  checked={organic}
                  onChange={(e) => setOrganic(e.target.checked)}
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
                  checked={lowestPrice}
                  onChange={(e) => setLowestPrice(e.target.checked)}
                  className="rounded text-green-500 focus:ring-green-500 cursor-pointer"
                />
                <span>Lowest price</span>
              </label>
            </div>

            <button
              onClick={addItem}
              disabled={!name}
              className="w-full bg-green-500 text-white px-6 py-3 rounded-lg font-medium flex items-center justify-center space-x-2 hover:bg-green-600 transition-colors duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <PlusCircle className="w-5 h-5" />
              <span>Add to List</span>
            </button>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-lg p-6 mb-8">
          <h2 className="text-xl font-semibold mb-4 text-gray-800 flex items-center">
            <ShoppingCart className="w-6 h-6 mr-2" />
            Shopping List
          </h2>
          
          {items.length === 0 ? (
            <p className="text-gray-500 text-center py-8">Your shopping list is empty</p>
          ) : (
            <div className="space-y-3">
              {items.map((item, i) => (
                <div key={i} className="flex items-start justify-between p-4 rounded-lg bg-gray-50 hover:bg-gray-100 transition-colors duration-200">
                  <div className="flex-1">
                    <div className="font-medium text-gray-800">
                      {item.name} × {item.quantity}
                    </div>
                    <div className="mt-1 text-sm text-gray-600 space-y-1">
                      {item.preferences.organic && (
                        <span className="inline-flex items-center mr-3">
                          <Leaf className="w-4 h-4 mr-1 text-green-500" />
                          Organic
                        </span>
                      )}
                      {item.preferences.brand && (
                        <span className="inline-block mr-3">Brand: {item.preferences.brand}</span>
                      )}
                      {item.preferences.country && (
                        <span className="inline-block mr-3">Origin: {item.preferences.country}</span>
                      )}
                      {item.preferences.lowestPrice && (
                        <span className="inline-block">Lowest price preferred</span>
                      )}
                    </div>
                  </div>
                  <button
                    onClick={() => removeItem(i)}
                    className="ml-4 p-1 text-gray-400 hover:text-red-500 transition-colors duration-200"
                  >
                    <X className="w-5 h-5" />
                  </button>
                </div>
              ))}
              
              <button
                onClick={submitItems}
                className="w-full mt-6 bg-blue-600 text-white px-6 py-3 rounded-lg font-medium flex items-center justify-center space-x-2 hover:bg-blue-700 transition-colors duration-200"
              >
                <Brain className="w-5 h-5" />
                <span>Start AI Shopping</span>
              </button>
            </div>
          )}
        </div>

        {result.length > 0 && (
          <div className="bg-white rounded-xl shadow-lg p-6">
            <h2 className="text-xl font-semibold mb-4 text-gray-800 flex items-center">
              <Brain className="w-6 h-6 mr-2" />
              AI Results
            </h2>
            
            <div className="space-y-4">
              {result.map((r, i) => (
                <div key={i} className="p-4 rounded-lg bg-gray-50 border border-gray-100">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="font-medium text-gray-800">
                        {r.name} × {r.quantity}
                      </div>
                      <div className="mt-1 text-sm">
                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                          {r.status}
                        </span>
                      </div>
                    </div>
                    <ChevronRight className="w-5 h-5 text-gray-400" />
                  </div>
                  
                  {r.reason && (
                    <div className="mt-3 text-sm text-gray-600">
                      <div className="font-medium mb-1">AI's Reasoning:</div>
                      <p>{r.reason}</p>
                    </div>
                  )}
                  
                  {r.suggestions && r.suggestions.length > 0 && (
                    <div className="mt-3 text-sm text-gray-600">
                      <div className="font-medium mb-1">Suggestions:</div>
                      <ul className="list-disc list-inside space-y-1">
                        {r.suggestions.map((s: string) => (
                          <li key={s}>{s}</li>
                        ))}
                      </ul>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
