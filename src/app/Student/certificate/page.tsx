'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Layout from '@/components/layouts/layout';
import {
  CheckCircle,
  AlertCircle,
  FileText,
  Calendar,
  MapPin,
  CreditCard,
  ChevronRight,
  Printer
} from 'lucide-react';

// Certificate request page for students/candidates
export default function CertificateRequestPage() {
  const router = useRouter();

  // Define types
  interface FormData {
    certificateType: 'original' | 'duplicate';
    deliveryMethod: 'pickup' | 'courier';
    shippingAddress: string;
    contactPhone: string;
    paymentMethod: 'momo' | 'bank' | 'cash';
    reason: string;
  }

  interface ExamInfo {
    candidateName: string;
    candidateNumber: string;
    examType: string;
    examYear: string;
    subjects: Array<{
      name: string;
      grade: string;
    }>;
  }

  // State management
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState<FormData>({
    certificateType: 'original',
    deliveryMethod: 'pickup',
    shippingAddress: '',
    contactPhone: '',
    paymentMethod: 'momo',
    reason: '',
  });
  const [examInfo] = useState<ExamInfo>({
    candidateName: 'John Doe',
    candidateNumber: 'GCE2024001245',
    examType: 'Advanced Level',
    examYear: '2024',
    subjects: [
      { name: 'Mathematics', grade: 'A' },
      { name: 'Physics', grade: 'B' },
      { name: 'Chemistry', grade: 'A' },
      { name: 'Computer Science', grade: 'A*' }
    ]
  });
  const [step, setStep] = useState(1);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [trackingNumber, setTrackingNumber] = useState('');

  // Handle form input changes
  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  // Calculate fees based on selections
  const calculateFees = () => {
    let baseFee = formData.certificateType === 'original' ? 5000 : 7500;
    let deliveryFee = formData.deliveryMethod === 'pickup' ? 0 : 2500;
    let processingFee = 1000;

    return {
      baseFee,
      deliveryFee,
      processingFee,
      totalFee: baseFee + deliveryFee + processingFee
    };
  };

  const fees = calculateFees();

  // Handle form submission
  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true);

    // Simulate API call
    setTimeout(() => {
      setTrackingNumber('CRT' + Math.floor(100000 + Math.random() * 900000));
      setIsSubmitted(true);
      setLoading(false);
    }, 2000);
  };

  // Handle step navigation
  const goToNextStep = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setStep(prev => prev + 1);
  };

  const goToPreviousStep = () => {
    setStep(prev => prev - 1);
  };

  // Reset form and start over
  const startNewRequest = () => {
    setFormData({
      certificateType: 'original',
      deliveryMethod: 'pickup',
      shippingAddress: '',
      contactPhone: '',
      paymentMethod: 'momo',
      reason: '',
    });
    setStep(1);
    setIsSubmitted(false);
    setTrackingNumber('');
  };

  return (
    <Layout>
      <div className="container mx-auto py-8 px-4">
        <div className="mb-6">
          <h1 className="text-2xl font-bold text-gray-800 mb-2">Certificate Request</h1>
          <p className="text-gray-600">Request your official GCE certificate based on your examination results</p>
        </div>

        {/* Progress Indicator */}
        {!isSubmitted && (
          <div className="mb-8">
            <div className="flex items-center justify-between mb-2">
              {[1, 2, 3].map((stepNumber) => (
                <div key={stepNumber} className="flex flex-col items-center">
                  <div className={`w-10 h-10 flex items-center justify-center rounded-full border-2 ${
                    step >= stepNumber ? 'bg-blue-600 border-blue-600 text-white' : 'border-gray-300 text-gray-400'
                  }`}>
                    {stepNumber}
                  </div>
                  <span className={`mt-2 text-sm ${step >= stepNumber ? 'text-blue-600' : 'text-gray-400'}`}>
                    {stepNumber === 1 ? 'Request' : stepNumber === 2 ? 'Review' : 'Payment'}
                  </span>
                </div>
              ))}
            </div>
            <div className="relative h-2 bg-gray-200 rounded-full">
              <div
                className="absolute top-0 left-0 h-2 bg-blue-600 rounded-full transition-all duration-300"
                style={{ width: `${((step - 1) / 2) * 100}%` }}
              ></div>
            </div>
          </div>
        )}

        {isSubmitted ? (
          // Confirmation Screen
          <div className="bg-white shadow-md rounded-lg p-6 border border-gray-100">
            <div className="flex flex-col items-center text-center mb-6">
              <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mb-4">
                <CheckCircle className="w-8 h-8 text-green-600" />
              </div>
              <h2 className="text-xl font-bold text-gray-800">Certificate Request Submitted!</h2>
              <p className="text-gray-600 mt-2">Your certificate request has been successfully submitted and is being processed.</p>
            </div>

            <div className="bg-gray-50 rounded-lg p-4 mb-6">
              <h3 className="font-medium text-gray-700 mb-3">Request Details</h3>
              <div className="flex justify-between mb-2">
                <span className="text-gray-600">Tracking Number:</span>
                <span className="font-medium">{trackingNumber}</span>
              </div>
              <div className="flex justify-between mb-2">
                <span className="text-gray-600">Certificate Type:</span>
                <span className="font-medium">
                  {formData.certificateType === 'original' ? 'Original Certificate' : 'Certified Copy'}
                </span>
              </div>
              <div className="flex justify-between mb-2">
                <span className="text-gray-600">Delivery Method:</span>
                <span className="font-medium">
                  {formData.deliveryMethod === 'pickup' ? 'Office Pickup' : 'Courier Delivery'}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Total Fee:</span>
                <span className="font-medium">{fees.totalFee} XAF</span>
              </div>
            </div>

            <div className="bg-blue-50 rounded-lg p-4 mb-6 flex items-start">
              <AlertCircle className="w-5 h-5 text-blue-600 mr-3 mt-0.5 flex-shrink-0" />
              <div>
                <h4 className="font-medium text-blue-800">What happens next?</h4>
                <p className="text-blue-700 text-sm mt-1">
                  Your request will be processed within 3-5 business days. You will receive an SMS notification when your certificate is ready for pickup or has been dispatched via courier.
                </p>
              </div>
            </div>

            <div className="flex flex-col sm:flex-row gap-4">
              <button
                onClick={() => router.push('/student/certificate-tracking')}
                className="flex items-center justify-center px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
              >
                <FileText className="w-4 h-4 mr-2" />
                Track Your Request
              </button>
              <button
                onClick={startNewRequest}
                className="flex items-center justify-center px-4 py-2 border border-gray-300 text-gray-700 rounded-md hover:bg-gray-50 transition-colors"
              >
                Make Another Request
              </button>
              <button
                onClick={() => window.print()}
                className="flex items-center justify-center px-4 py-2 border border-gray-300 text-gray-700 rounded-md hover:bg-gray-50 transition-colors"
              >
                <Printer className="w-4 h-4 mr-2" />
                Print Receipt
              </button>
            </div>
          </div>
        ) : (
          // Request Forms
          <div className="bg-white shadow-md rounded-lg p-6 border border-gray-100">
            {step === 1 && (
              <form onSubmit={goToNextStep}>
                <div className="mb-6">
                  <h2 className="text-lg font-semibold text-gray-800 mb-4">Certificate Request Details</h2>

                  <div className="mb-4">
                    <label className="block text-gray-700 text-sm font-medium mb-2">Certificate Type</label>
                    <div className="flex flex-col gap-3">
                      <label className="flex items-center p-3 border rounded-md hover:bg-gray-50 cursor-pointer">
                        <input
                          type="radio"
                          name="certificateType"
                          value="original"
                          checked={formData.certificateType === 'original'}
                          onChange={handleChange}
                          className="mr-3"
                        />
                        <div>
                          <div className="font-medium">Original Certificate</div>
                          <div className="text-sm text-gray-500">First-time certificate issuance (5,000 XAF)</div>
                        </div>
                      </label>
                      <label className="flex items-center p-3 border rounded-md hover:bg-gray-50 cursor-pointer">
                        <input
                          type="radio"
                          name="certificateType"
                          value="duplicate"
                          checked={formData.certificateType === 'duplicate'}
                          onChange={handleChange}
                          className="mr-3"
                        />
                        <div>
                          <div className="font-medium">Certified Duplicate</div>
                          <div className="text-sm text-gray-500">Replacement for lost or damaged certificate (7,500 XAF)</div>
                        </div>
                      </label>
                    </div>
                  </div>

                  {formData.certificateType === 'duplicate' && (
                    <div className="mb-4">
                      <label className="block text-gray-700 text-sm font-medium mb-2" htmlFor="reason">
                        Reason for Duplicate
                      </label>
                      <select
                        id="reason"
                        name="reason"
                        value={formData.reason}
                        onChange={handleChange}
                        className="w-full p-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                        required
                      >
                        <option value="">Select a reason</option>
                        <option value="lost">Lost Certificate</option>
                        <option value="damaged">Damaged Certificate</option>
                        <option value="stolen">Stolen Certificate</option>
                        <option value="name_change">Name Change</option>
                        <option value="other">Other</option>
                      </select>
                    </div>
                  )}

                  <div className="mb-4">
                    <label className="block text-gray-700 text-sm font-medium mb-2">Delivery Method</label>
                    <div className="flex flex-col gap-3">
                      <label className="flex items-center p-3 border rounded-md hover:bg-gray-50 cursor-pointer">
                        <input
                          type="radio"
                          name="deliveryMethod"
                          value="pickup"
                          checked={formData.deliveryMethod === 'pickup'}
                          onChange={handleChange}
                          className="mr-3"
                        />
                        <div>
                          <div className="font-medium">Office Pickup</div>
                          <div className="text-sm text-gray-500">Pick up your certificate at the GCE Board office (No delivery fee)</div>
                        </div>
                      </label>
                      <label className="flex items-center p-3 border rounded-md hover:bg-gray-50 cursor-pointer">
                        <input
                          type="radio"
                          name="deliveryMethod"
                          value="courier"
                          checked={formData.deliveryMethod === 'courier'}
                          onChange={handleChange}
                          className="mr-3"
                        />
                        <div>
                          <div className="font-medium">Courier Delivery</div>
                          <div className="text-sm text-gray-500">Delivered to your provided address (2,500 XAF delivery fee)</div>
                        </div>
                      </label>
                    </div>
                  </div>

                  {formData.deliveryMethod === 'courier' && (
                    <>
                      <div className="mb-4">
                        <label className="block text-gray-700 text-sm font-medium mb-2" htmlFor="shippingAddress">
                          Shipping Address
                        </label>
                        <textarea
                          id="shippingAddress"
                          name="shippingAddress"
                          value={formData.shippingAddress}
                          onChange={handleChange}
                          className="w-full p-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                          rows={3}
                          required
                        ></textarea>
                      </div>
                      <div className="mb-4">
                        <label className="block text-gray-700 text-sm font-medium mb-2" htmlFor="contactPhone">
                          Contact Phone
                        </label>
                        <input
                          type="tel"
                          id="contactPhone"
                          name="contactPhone"
                          value={formData.contactPhone}
                          onChange={handleChange}
                          className="w-full p-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                          placeholder="e.g., 6XX XXX XXX"
                          required
                        />
                      </div>
                    </>
                  )}
                </div>

                <div className="flex justify-end">
                  <button
                    type="submit"
                    className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
                  >
                    Continue
                    <ChevronRight className="w-4 h-4 ml-2" />
                  </button>
                </div>
              </form>
            )}

            {step === 2 && (
              <form onSubmit={goToNextStep}>
                <div className="mb-6">
                  <h2 className="text-lg font-semibold text-gray-800 mb-4">Review Your Request</h2>

                  <div className="bg-gray-50 rounded-lg p-4 mb-6">
                    <h3 className="font-medium text-gray-700 mb-3">Candidate Information</h3>
                    <div className="flex justify-between mb-2">
                      <span className="text-gray-600">Full Name:</span>
                      <span className="font-medium">{examInfo.candidateName}</span>
                    </div>
                    <div className="flex justify-between mb-2">
                      <span className="text-gray-600">Candidate Number:</span>
                      <span className="font-medium">{examInfo.candidateNumber}</span>
                    </div>
                    <div className="flex justify-between mb-2">
                      <span className="text-gray-600">Examination Type:</span>
                      <span className="font-medium">{examInfo.examType}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Examination Year:</span>
                      <span className="font-medium">{examInfo.examYear}</span>
                    </div>
                  </div>

                  <div className="bg-gray-50 rounded-lg p-4 mb-6">
                    <h3 className="font-medium text-gray-700 mb-3">Certificate Details</h3>
                    <div className="flex justify-between mb-2">
                      <span className="text-gray-600">Certificate Type:</span>
                      <span className="font-medium">
                        {formData.certificateType === 'original' ? 'Original Certificate' : 'Certified Copy'}
                      </span>
                    </div>
                    {formData.certificateType === 'duplicate' && (
                      <div className="flex justify-between mb-2">
                        <span className="text-gray-600">Reason:</span>
                        <span className="font-medium">
                          {formData.reason === 'lost' ? 'Lost Certificate' :
                           formData.reason === 'damaged' ? 'Damaged Certificate' :
                           formData.reason === 'stolen' ? 'Stolen Certificate' :
                           formData.reason === 'name_change' ? 'Name Change' : 'Other'}
                        </span>
                      </div>
                    )}
                    <div className="flex justify-between mb-2">
                      <span className="text-gray-600">Delivery Method:</span>
                      <span className="font-medium">
                        {formData.deliveryMethod === 'pickup' ? 'Office Pickup' : 'Courier Delivery'}
                      </span>
                    </div>
                    {formData.deliveryMethod === 'courier' && (
                      <>
                        <div className="flex justify-between mb-2">
                          <span className="text-gray-600">Shipping Address:</span>
                          <span className="font-medium max-w-md text-right">{formData.shippingAddress}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-600">Contact Phone:</span>
                          <span className="font-medium">{formData.contactPhone}</span>
                        </div>
                      </>
                    )}
                  </div>

                  <div className="bg-gray-50 rounded-lg p-4">
                    <h3 className="font-medium text-gray-700 mb-3">Fee Summary</h3>
                    <div className="flex justify-between mb-2">
                      <span className="text-gray-600">Certificate Fee:</span>
                      <span className="font-medium">{fees.baseFee} XAF</span>
                    </div>
                    <div className="flex justify-between mb-2">
                      <span className="text-gray-600">Delivery Fee:</span>
                      <span className="font-medium">{fees.deliveryFee} XAF</span>
                    </div>
                    <div className="flex justify-between mb-2">
                      <span className="text-gray-600">Processing Fee:</span>
                      <span className="font-medium">{fees.processingFee} XAF</span>
                    </div>
                    <div className="flex justify-between pt-2 border-t">
                      <span className="text-gray-800 font-medium">Total:</span>
                      <span className="font-bold text-blue-700">{fees.totalFee} XAF</span>
                    </div>
                  </div>
                </div>

                <div className="flex justify-between">
                  <button
                    type="button"
                    onClick={goToPreviousStep}
                    className="px-4 py-2 border border-gray-300 text-gray-700 rounded-md hover:bg-gray-50 transition-colors"
                  >
                    Back
                  </button>
                  <button
                    type="submit"
                    className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
                  >
                    Proceed to Payment
                    <ChevronRight className="w-4 h-4 ml-2" />
                  </button>
                </div>
              </form>
            )}

            {step === 3 && (
              <form onSubmit={handleSubmit}>
                <div className="mb-6">
                  <h2 className="text-lg font-semibold text-gray-800 mb-4">Payment</h2>

                  <div className="bg-blue-50 rounded-lg p-4 mb-6 flex items-start">
                    <AlertCircle className="w-5 h-5 text-blue-600 mr-3 mt-0.5 flex-shrink-0" />
                    <div>
                      <h4 className="font-medium text-blue-800">Payment Information</h4>
                      <p className="text-blue-700 text-sm mt-1">
                        Please select your preferred payment method to complete your certificate request.
                        The total amount to be paid is <strong>{fees.totalFee} XAF</strong>.
                      </p>
                    </div>
                  </div>

                  <div className="mb-4">
                    <label className="block text-gray-700 text-sm font-medium mb-2">Payment Method</label>
                    <div className="flex flex-col gap-3">
                      <label className="flex items-center p-3 border rounded-md hover:bg-gray-50 cursor-pointer">
                        <input
                          type="radio"
                          name="paymentMethod"
                          value="momo"
                          checked={formData.paymentMethod === 'momo'}
                          onChange={handleChange}
                          className="mr-3"
                        />
                        <div className="flex-1">
                          <div className="font-medium">Mobile Money</div>
                          <div className="text-sm text-gray-500">Pay using MTN Mobile Money or Orange Money</div>
                        </div>
                        <div className="flex space-x-2">
                          <div className="w-8 h-8 bg-yellow-500 rounded-full flex items-center justify-center text-white font-bold">M</div>
                          <div className="w-8 h-8 bg-orange-500 rounded-full flex items-center justify-center text-white font-bold">O</div>
                        </div>
                      </label>
                      <label className="flex items-center p-3 border rounded-md hover:bg-gray-50 cursor-pointer">
                        <input
                          type="radio"
                          name="paymentMethod"
                          value="bank"
                          checked={formData.paymentMethod === 'bank'}
                          onChange={handleChange}
                          className="mr-3"
                        />
                        <div className="flex-1">
                          <div className="font-medium">Bank Transfer</div>
                          <div className="text-sm text-gray-500">Pay directly to our bank account</div>
                        </div>
                        <div className="w-8 h-8 bg-blue-500 rounded-full flex items-center justify-center text-white font-bold">B</div>
                      </label>
                      <label className="flex items-center p-3 border rounded-md hover:bg-gray-50 cursor-pointer">
                        <input
                          type="radio"
                          name="paymentMethod"
                          value="cash"
                          checked={formData.paymentMethod === 'cash'}
                          onChange={handleChange}
                          className="mr-3"
                        />
                        <div className="flex-1">
                          <div className="font-medium">Pay at Office</div>
                          <div className="text-sm text-gray-500">Make payment when collecting the certificate</div>
                        </div>
                        <div className="w-8 h-8 bg-green-500 rounded-full flex items-center justify-center text-white font-bold">₣</div>
                      </label>
                    </div>
                  </div>

                  {formData.paymentMethod === 'momo' && (
                    <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mb-4">
                      <h4 className="font-medium text-yellow-800 mb-2">Mobile Money Payment Instructions</h4>
                      <ol className="list-decimal list-inside text-sm text-yellow-700 space-y-2">
                        <li>Click the "Complete Payment" button below</li>
                        <li>You will receive a payment prompt on your registered mobile number</li>
                        <li>Enter your Mobile Money PIN to confirm payment</li>
                        <li>Once payment is confirmed, your certificate request will be processed</li>
                      </ol>
                    </div>
                  )}

                  {formData.paymentMethod === 'bank' && (
                    <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-4">
                      <h4 className="font-medium text-blue-800 mb-2">Bank Transfer Instructions</h4>
                      <div className="space-y-2 text-sm text-blue-700">
                        <p>Please transfer the total amount to our bank account:</p>
                        <div className="bg-white p-3 rounded border border-blue-100">
                          <div className="grid grid-cols-2 gap-2">
                            <div className="text-gray-600">Bank Name:</div>
                            <div className="font-medium">Cameroon GCE Board Bank</div>
                            <div className="text-gray-600">Account Name:</div>
                            <div className="font-medium">GCE Board Certification</div>
                            <div className="text-gray-600">Account Number:</div>
                            <div className="font-medium">1234-5678-9012-3456</div>
                            <div className="text-gray-600">Reference:</div>
                            <div className="font-medium">{examInfo.candidateNumber}</div>
                          </div>
                        </div>
                        <p>After making the transfer, upload your payment receipt before clicking "Complete Payment".</p>
                        <div className="mt-2">
                          <input
                            type="file"
                            className="block w-full text-sm text-gray-500
                              file:mr-4 file:py-2 file:px-4
                              file:rounded-md file:border-0
                              file:text-sm file:font-medium
                              file:bg-blue-50 file:text-blue-700
                              hover:file:bg-blue-100"
                          />
                        </div>
                      </div>
                    </div>
                  )}

                  {formData.paymentMethod === 'cash' && (
                    <div className="bg-green-50 border border-green-200 rounded-lg p-4 mb-4">
                      <h4 className="font-medium text-green-800 mb-2">Pay at Office Information</h4>
                      <div className="space-y-2 text-sm text-green-700">
                        <p>Your request will be registered but the certificate will only be issued after payment is made at:</p>
                        <div className="flex items-start mt-2">
                          <MapPin className="w-5 h-5 mr-2 flex-shrink-0 mt-0.5" />
                          <span>GCE Board Office, Buea Road, South West Region, Cameroon</span>
                        </div>
                        <div className="flex items-start mt-2">
                          <Calendar className="w-5 h-5 mr-2 flex-shrink-0 mt-0.5" />
                          <span>Working Hours: Monday to Friday, 8:00 AM - 3:30 PM</span>
                        </div>
                        <p className="font-medium mt-2">Please bring your ID card and candidate number when making the payment.</p>
                      </div>
                    </div>
                  )}
                </div>

                <div className="flex justify-between">
                  <button
                    type="button"
                    onClick={goToPreviousStep}
                    className="px-4 py-2 border border-gray-300 text-gray-700 rounded-md hover:bg-gray-50 transition-colors"
                  >
                    Back
                  </button>
                  <button
                    type="submit"
                    disabled={loading}
                    className={`flex items-center px-6 py-2 ${
                      loading ? 'bg-gray-400' : 'bg-blue-600 hover:bg-blue-700'
                    } text-white rounded-md transition-colors`}
                  >
                    {loading ? (
                      <>
                        <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                        </svg>
                        Processing
                      </>
                    ) : (
                      <>
                        <CreditCard className="w-5 h-5 mr-2" />
                        Complete Payment
                      </>
                    )}
                  </button>
                </div>
              </form>
            )}
          </div>
        )}

        {/* Additional Information Section */}
        {!isSubmitted && (
          <div className="mt-8 grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="bg-white p-5 rounded-lg shadow-sm border border-gray-100">
              <div className="flex items-center mb-3">
                <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center mr-3">
                  <Calendar className="w-5 h-5 text-blue-600" />
                </div>
                <h3 className="font-medium text-gray-800">Processing Time</h3>
              </div>
              <p className="text-gray-600 text-sm">
                Original certificates are typically processed within 7-10 business days.
                Duplicate certificates may take 14-21 business days for verification and processing.
              </p>
            </div>

            <div className="bg-white p-5 rounded-lg shadow-sm border border-gray-100">
              <div className="flex items-center mb-3">
                <div className="w-10 h-10 bg-green-100 rounded-full flex items-center justify-center mr-3">
                  <MapPin className="w-5 h-5 text-green-600" />
                </div>
                <h3 className="font-medium text-gray-800">Collection Points</h3>
              </div>
              <p className="text-gray-600 text-sm">
                Certificates can be collected from the GCE Board office in Buea.
                For courier delivery, we partner with reliable courier services to deliver nationwide.
              </p>
            </div>

            <div className="bg-white p-5 rounded-lg shadow-sm border border-gray-100">
              <div className="flex items-center mb-3">
                <div className="w-10 h-10 bg-yellow-100 rounded-full flex items-center justify-center mr-3">
                  <AlertCircle className="w-5 h-5 text-yellow-600" />
                </div>
                <h3 className="font-medium text-gray-800">Important Notice</h3>
              </div>
              <p className="text-gray-600 text-sm">
                Please ensure all information provided is accurate. Certificates are official documents
                and corrections after issuance may require a new application and additional fees.
              </p>
            </div>
          </div>
        )}
      </div>
    </Layout>
  );
}