import React from 'react';

export const ProductRecommendations: React.FC = () => {
  return (
    <section className="bg-gray-50 py-12">
      <div className="max-w-6xl mx-auto px-4">
        <h2 className="text-2xl font-medium mb-8 text-center">You May Also Like</h2>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
          {/* This would typically be populated with recommended products */}
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="aspect-square bg-white border border-gray-100"></div>
          ))}
        </div>
      </div>
    </section>
  );
};
