import { useState } from 'react';
import axios from 'axios';
import { PlusCircle, ShoppingCart, Brain, X, ChevronRight, Leaf, CircleDollarSign } from 'lucide-react';

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
  item: GroceryItem
  status: 'added' | 'skipped' | 'not_added' | 'error';
  reason?: string;
  productName?: string;
  href?: string;
  price?: string;
  suggestions?: string[];
}

export const GroceryInput = () => {
  const [automationConsent, setAutomationConsent] = useState(false);
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
                <span className="flex items-center">
                  <CircleDollarSign className="w-4 h-4 mr-1 text-orange-500" />Lowest Price</span>
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
                        <span className="inline-flex items-center mr-3">
                          <CircleDollarSign className="w-4 h-4 mr-1 text-orange-500" />
                          Lowest price preferred
                        </span>
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

              <div className="mt-4 space-y-2 border p-3 rounded bg-yellow-50 cursor-pointer transform transition-transform duration-300 ease-in-out hover:scale-105" 
                onClick={() => setAutomationConsent(!automationConsent)}>
                <label className="flex items-start space-x-2">
                  <input
                    type="checkbox"
                    checked={automationConsent}
                    onChange={(e) => setAutomationConsent(e.target.checked)}
                    className="mt-1 rounded text-green-500 focus:ring-green-500 cursor-pointer"
                  />
                  <span className="text-sm">
                    I allow this app to run automation on my Amazon account to add groceries to my cart.
                  </span>
                </label>
                <div className="text-xs text-gray-600 pl-6">
                  ⚠️ This automation <strong>does not purchase</strong> anything. It only:
                  <ul className="list-disc list-inside mt-1 pl-5">
                    <li>Searches for your selected items</li>
                    <li>Adds matching items to your Amazon cart</li>
                    <li>Shows product suggestions based on your preferences</li>
                  </ul>
                </div>
              </div>

              <div className="flex flex-row gap-5 mt-6">
                <button
                  onClick={() => window.open('https://www.amazon.com/gp/cart/view.html?ref_=nav_cart', '_blank')}
                  className="w-full border-2 border-gray-300 bg-white text-gray-700 px-6 py-3 rounded-lg font-medium flex items-center justify-center space-x-2 hover:bg-gray-50 hover:border-gray-400 transition-colors duration-200"
                >
                  <ShoppingCart className="w-5 h-5" />
                  <span>Go to Shopping Cart</span>
                </button>
                
                <button
                  onClick={submitItems}
                  disabled={!automationConsent}
                  className="w-full bg-blue-600 text-white px-6 py-3 rounded-lg font-medium flex items-center justify-center space-x-2 hover:bg-blue-700 transition-colors duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <Brain className="w-5 h-5" />
                  <span>Start AI Shopping</span>
                </button>
              </div>
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
                        {/* Show requested item details */}
                        <div className="flex flex-row items-center">
                          <span>Requested: {r.item?.name} × {r.item?.quantity}</span>
                          {r.status !== 'added' &&  (
                            <span className={`inline-flex items-center ml-3 px-2.5 py-0.5 rounded-full text-xs font-medium ${
                              r.status === 'skipped' ? 'bg-yellow-100 text-yellow-800' :
                              'bg-red-100 text-red-800'
                            }`}>
                          {r.status}
                        </span>
                        )}
                          {(r.item?.preferences?.organic) && (
                            <span className="inline-flex items-center ml-2">
                              <Leaf className="w-4 h-4 mr-1 text-green-500" />
                              Organic
                            </span>
                          )}
                          {(r.item?.preferences?.lowestPrice) && (
                            <span className="inline-flex items-center ml-2">
                              <CircleDollarSign className="w-4 h-4 mr-1 text-orange-500" />
                              Lowest Price
                            </span>
                          )}
                        </div>
                        <div className="mb-2 flex flex-row items-center">
                          {(r.item?.preferences?.brand) && (
                            <span className="font-medium">Brand: {r.item?.preferences?.brand}</span>
                          )}
                          {(r.item?.preferences?.country) && (
                            <span className="font-medium">Origin: {r.item?.preferences?.country}</span>
                          )}
                        </div>
                        {/* Show matched product details if available */}
                        {r.status === 'added' && r.productName && (
                          <div className="text-green-700">
                            Found: {r.productName} {r.price && `- ${r.price}`}
                            <span className='inline-flex items-center ml-3 px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800'>
                              {r.status}
                            </span>
                          </div>
                        )}
                      </div>
                    </div>
                    {r.href && (
                      <a
                        href={r.href}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="p-2 hover:bg-gray-200 rounded-full transition-colors duration-200"
                      >
                        <ChevronRight className="w-5 h-5 text-gray-400 hover:text-gray-600" />
                      </a>
                    )}
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