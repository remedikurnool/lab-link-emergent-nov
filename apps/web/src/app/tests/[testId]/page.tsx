'use client';

import { useState, use } from 'react';
import { TopBar } from '@/components/navigation/TopBar';
import { BottomNav } from '@/components/navigation/BottomNav';
import { testsWithCentres } from '@/lib/data/mockDataWithCentres';
import { useCartStore } from '@/store/cartStore';
import {
  Clock,
  TestTube2,
  Building2,
  Home,
  CheckCircle,
  ArrowLeft,
} from 'lucide-react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';

export default function TestDetailPage(props: {
  params: Promise<{ testId: string }>;
}) {
  const params = use(props.params);
  const router = useRouter();
  const test = testsWithCentres.find((t) => t.id === params.testId);
  const [selectedCentre, setSelectedCentre] = useState(
    test?.centres[0]?.centreId || ''
  );
  const { addItem } = useCartStore();

  if (!test) {
    return (
      <div className="min-h-screen bg-gray-50">
        <TopBar />
        <div className="container mx-auto px-4 py-12 text-center">
          <h1 className="text-2xl font-bold text-gray-900 mb-4">Test Not Found</h1>
          <Link
            href="/tests"
            className="text-primary-600 hover:text-primary-700 font-medium"
          >
            Back to Tests
          </Link>
        </div>
      </div>
    );
  }

  const selectedCentreData = test.centres.find(
    (c) => c.centreId === selectedCentre
  );

  const handleAddToCart = () => {
    if (selectedCentreData) {
      addItem({
        id: test.id,
        type: 'test',
        name: test.name,
        price: selectedCentreData.price,
        originalPrice: selectedCentreData.originalPrice,
        diagnosticCenterId: selectedCentreData.centreId,
        diagnosticCenterName: selectedCentreData.centreName,
        reportDeliveryTime: selectedCentreData.reportDeliveryTime,
        testsIncluded: test.testsIncluded,
      });
      // Show success message or redirect
      alert('Added to cart successfully!');
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <TopBar />

      <main className="pb-20 md:pb-8">
        <div className="container mx-auto px-4 py-6 space-y-6">
          {/* Back Button */}
          <button
            onClick={() => router.back()}
            className="flex items-center gap-2 text-gray-600 hover:text-gray-900"
          >
            <ArrowLeft className="w-5 h-5" />
            <span className="font-medium">Back</span>
          </button>

          {/* Test Header */}
          <div className="bg-white rounded-xl p-6 border border-gray-200">
            <h1 className="text-2xl font-bold text-gray-900 mb-2">
              {test.name}
            </h1>
            <p className="text-gray-600 mb-4">{test.description}</p>

            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="flex items-center gap-2">
                <TestTube2 className="w-5 h-5 text-primary-500" />
                <div>
                  <div className="text-xs text-gray-500">Tests Included</div>
                  <div className="font-semibold">{test.testsIncluded}</div>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <TestTube2 className="w-5 h-5 text-primary-500" />
                <div>
                  <div className="text-xs text-gray-500">Sample Type</div>
                  <div className="font-semibold">{test.sampleType}</div>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <Building2 className="w-5 h-5 text-primary-500" />
                <div>
                  <div className="text-xs text-gray-500">Centres</div>
                  <div className="font-semibold">{test.centres.length}</div>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <Clock className="w-5 h-5 text-primary-500" />
                <div>
                  <div className="text-xs text-gray-500">Reports From</div>
                  <div className="font-semibold">
                    {Math.min(
                      ...test.centres.map((c) =>
                        parseInt(c.reportDeliveryTime.split(' ')[0])
                      )
                    )}{' '}hrs
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Parameters */}
          {test.parameters && test.parameters.length > 0 && (
            <div className="bg-white rounded-xl p-6 border border-gray-200">
              <h2 className="text-lg font-bold text-gray-900 mb-4">
                Parameters Included
              </h2>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                {test.parameters.map((param, idx) => (
                  <div
                    key={idx}
                    className="flex items-center gap-2 text-sm text-gray-700"
                  >
                    <CheckCircle className="w-4 h-4 text-green-500" />
                    <span>{param}</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Preparation Instructions */}
          {test.preparationInstructions && (
            <div className="bg-blue-50 border border-blue-200 rounded-xl p-4">
              <h3 className="font-semibold text-blue-900 mb-2">
                Preparation Instructions
              </h3>
              <p className="text-sm text-blue-800">
                {test.preparationInstructions}
              </p>
            </div>
          )}

          {/* Diagnostic Centres */}
          <div className="bg-white rounded-xl p-6 border border-gray-200">
            <h2 className="text-lg font-bold text-gray-900 mb-4">
              Available at {test.centres.length} Diagnostic Centre{test.centres.length > 1 ? 's' : ''}
            </h2>

            <div className="space-y-4">
              {test.centres.map((centre) => (
                <div
                  key={centre.centreId}
                  onClick={() => setSelectedCentre(centre.centreId)}
                  className={`border-2 rounded-xl p-4 cursor-pointer transition-all ${
                    selectedCentre === centre.centreId
                      ? 'border-primary-500 bg-primary-50'
                      : 'border-gray-200 hover:border-gray-300'
                  }`}
                >
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex-1">
                      <h3 className="font-bold text-gray-900 mb-1">
                        {centre.centreName}
                      </h3>
                      <div className="flex flex-wrap items-center gap-3 text-sm text-gray-600">
                        <div className="flex items-center gap-1">
                          <Clock className="w-4 h-4" />
                          <span>Report: {centre.reportDeliveryTime}</span>
                        </div>
                        {centre.homeCollection && (
                          <div className="flex items-center gap-1 text-green-600">
                            <Home className="w-4 h-4" />
                            <span>Home Collection</span>
                          </div>
                        )}
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <input
                        type="radio"
                        checked={selectedCentre === centre.centreId}
                        onChange={() => setSelectedCentre(centre.centreId)}
                        className="w-5 h-5 text-primary-600"
                      />
                    </div>
                  </div>

                  <div className="flex items-baseline gap-2">
                    <span className="text-2xl font-bold text-gray-900">
                      ₹{centre.price}
                    </span>
                    {centre.originalPrice && (
                      <>
                        <span className="text-sm line-through text-gray-400">
                          ₹{centre.originalPrice}
                        </span>
                        <span className="px-2 py-0.5 bg-green-100 text-green-700 text-xs font-semibold rounded">
                          {centre.discount}% OFF
                        </span>
                      </>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Add to Cart Button */}
          <div className="fixed bottom-20 md:bottom-8 left-0 right-0 px-4 md:relative md:px-0">
            <button
              onClick={handleAddToCart}
              disabled={!selectedCentreData}
              className="w-full py-4 bg-primary-500 hover:bg-primary-600 disabled:bg-gray-300 disabled:cursor-not-allowed text-white font-bold rounded-xl transition-colors shadow-lg"
            >
              Add to Cart - ₹{selectedCentreData?.price || 0}
            </button>
          </div>
        </div>
      </main>

      <BottomNav />
    </div>
  );
}
