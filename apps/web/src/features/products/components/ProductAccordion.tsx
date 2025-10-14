import React, { useState } from 'react';
import { ChevronDown } from 'lucide-react';

interface AccordionItem {
  id: string;
  title: string;
  content: React.ReactNode;
}

interface ProductAccordionProps {
  description: string | null;
}

export const ProductAccordion: React.FC<ProductAccordionProps> = ({ description }) => {
  const [openAccordion, setOpenAccordion] = useState<string | null>('description');

  const toggleAccordion = (section: string) => {
    setOpenAccordion(openAccordion === section ? null : section);
  };

  const accordionItems: AccordionItem[] = [
    {
      id: 'description',
      title: 'Product Description',
      content: (
        <p>{description || 'No detailed description available for this product.'}</p>
      ),
    },
    {
      id: 'size',
      title: 'Size Guide',
      content: (
        <div className="overflow-x-auto">
          <table className="min-w-full">
            <thead>
              <tr className="border-b border-gray-200">
                <th className="text-left py-2 pr-4">Size</th>
                <th className="text-left py-2 px-4">Chest (inches)</th>
                <th className="text-left py-2 px-4">Length (inches)</th>
              </tr>
            </thead>
            <tbody>
              <tr className="border-b border-gray-100">
                <td className="py-2 pr-4">S</td>
                <td className="py-2 px-4">36-38</td>
                <td className="py-2 px-4">28</td>
              </tr>
              <tr className="border-b border-gray-100">
                <td className="py-2 pr-4">M</td>
                <td className="py-2 px-4">39-41</td>
                <td className="py-2 px-4">29</td>
              </tr>
              <tr className="border-b border-gray-100">
                <td className="py-2 pr-4">L</td>
                <td className="py-2 px-4">42-44</td>
                <td className="py-2 px-4">30</td>
              </tr>
              <tr className="border-b border-gray-100">
                <td className="py-2 pr-4">XL</td>
                <td className="py-2 px-4">45-47</td>
                <td className="py-2 px-4">31</td>
              </tr>
            </tbody>
          </table>
        </div>
      ),
    },
    {
      id: 'shipping',
      title: 'Shipping & Returns',
      content: (
        <div>
          <p className="mb-3">Free shipping on all orders over $100.</p>
          <p className="mb-3">Orders typically ship within 1-2 business days.</p>
          <p>Returns accepted within 30 days of delivery for unworn items.</p>
        </div>
      ),
    },
  ];

  return (
    <div className="border-t border-gray-200">
      {accordionItems.map((item) => (
        <div key={item.id} className="border-b border-gray-200">
          <button
            className="flex justify-between items-center w-full py-4 px-2 text-left focus:outline-none"
            onClick={() => toggleAccordion(item.id)}
            aria-expanded={openAccordion === item.id}
            aria-controls={`${item.id}-panel`}
          >
            <span className="font-medium uppercase text-sm">{item.title}</span>
            <ChevronDown
              className={`w-5 h-5 transition-transform ${openAccordion === item.id ? 'transform rotate-180' : ''}`}
            />
          </button>
          <div
            id={`${item.id}-panel`}
            className={`overflow-hidden transition-all duration-300 ${openAccordion === item.id ? 'max-h-96' : 'max-h-0'}`}
          >
            <div className="px-2 pb-4 text-gray-600">
              {item.content}
            </div>
          </div>
        </div>
      ))}
    </div>
  );
};
