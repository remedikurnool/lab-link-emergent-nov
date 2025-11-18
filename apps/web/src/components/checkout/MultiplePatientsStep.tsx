'use client';

import { useState } from 'react';
import { Plus, X, User } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { PatientDetails } from '@/store/bookingStore';

interface MultiplePatientsStepProps {
  patients: PatientDetails[];
  onPatientsChange: (patients: PatientDetails[]) => void;
  onNext: () => void;
}

export function MultiplePatientsStep({
  patients,
  onPatientsChange,
  onNext,
}: MultiplePatientsStepProps) {
  const [editingIndex, setEditingIndex] = useState<number | null>(null);

  const addPatient = () => {
    const newPatient: PatientDetails = {
      fullName: '',
      age: 0,
      gender: 'male',
      phone: '',
      relationship: 'self',
    };
    onPatientsChange([...patients, newPatient]);
    setEditingIndex(patients.length);
  };

  const updatePatient = (index: number, field: keyof PatientDetails, value: any) => {
    const updated = [...patients];
    updated[index] = { ...updated[index], [field]: value };
    onPatientsChange(updated);
  };

  const removePatient = (index: number) => {
    const updated = patients.filter((_, i) => i !== index);
    onPatientsChange(updated);
    if (editingIndex === index) setEditingIndex(null);
  };

  const canProceed = patients.every(
    (p) => p.fullName && p.age > 0 && p.phone.length >= 10
  );

  return (
    <div className="space-y-6">
      <div className="bg-white rounded-xl p-6 border border-gray-200">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-bold text-gray-900">
            Patient Information
          </h2>
          <Button
            type="button"
            onClick={addPatient}
            variant="outline"
            size="sm"
            className="flex items-center gap-2"
          >
            <Plus className="w-4 h-4" />
            Add Patient
          </Button>
        </div>

        {patients.length === 0 ? (
          <div className="text-center py-8 text-gray-500">
            <User className="w-12 h-12 mx-auto mb-3 text-gray-400" />
            <p>No patients added yet</p>
            <Button
              type="button"
              onClick={addPatient}
              variant="outline"
              className="mt-4"
            >
              Add First Patient
            </Button>
          </div>
        ) : (
          <div className="space-y-4">
            {patients.map((patient, index) => (
              <div
                key={index}
                className="border border-gray-200 rounded-lg p-4 space-y-3"
              >
                <div className="flex items-center justify-between">
                  <h3 className="font-semibold text-gray-900">
                    Patient {index + 1}
                  </h3>
                  {patients.length > 1 && (
                    <Button
                      type="button"
                      onClick={() => removePatient(index)}
                      variant="ghost"
                      size="sm"
                      className="text-red-600 hover:text-red-700"
                    >
                      <X className="w-4 h-4" />
                    </Button>
                  )}
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label>Full Name *</Label>
                    <Input
                      value={patient.fullName}
                      onChange={(e) =>
                        updatePatient(index, 'fullName', e.target.value)
                      }
                      placeholder="Enter patient's full name"
                      className="mt-1"
                    />
                  </div>

                  <div>
                    <Label>Relationship</Label>
                    <select
                      value={patient.relationship}
                      onChange={(e) =>
                        updatePatient(
                          index,
                          'relationship',
                          e.target.value as PatientDetails['relationship']
                        )
                      }
                      className="w-full mt-1 px-4 py-2 rounded-lg border border-gray-200 bg-white text-gray-900 focus:outline-none focus:ring-2 focus:ring-primary-500"
                    >
                      <option value="self">Myself</option>
                      <option value="mother">My Mother</option>
                      <option value="father">My Father</option>
                      <option value="spouse">My Spouse</option>
                      <option value="child">My Child</option>
                      <option value="other">Other</option>
                    </select>
                  </div>

                  <div>
                    <Label>Age *</Label>
                    <Input
                      type="number"
                      value={patient.age || ''}
                      onChange={(e) =>
                        updatePatient(index, 'age', parseInt(e.target.value) || 0)
                      }
                      placeholder="Age"
                      className="mt-1"
                      min="1"
                      max="120"
                    />
                  </div>

                  <div>
                    <Label>Gender *</Label>
                    <select
                      value={patient.gender}
                      onChange={(e) =>
                        updatePatient(
                          index,
                          'gender',
                          e.target.value as PatientDetails['gender']
                        )
                      }
                      className="w-full mt-1 px-4 py-2 rounded-lg border border-gray-200 bg-white text-gray-900 focus:outline-none focus:ring-2 focus:ring-primary-500"
                    >
                      <option value="male">Male</option>
                      <option value="female">Female</option>
                      <option value="other">Other</option>
                    </select>
                  </div>

                  <div>
                    <Label>Phone *</Label>
                    <Input
                      value={patient.phone}
                      onChange={(e) =>
                        updatePatient(index, 'phone', e.target.value)
                      }
                      placeholder="10 digit phone number"
                      className="mt-1"
                      maxLength={10}
                    />
                  </div>

                  <div>
                    <Label>Email (Optional)</Label>
                    <Input
                      type="email"
                      value={patient.email || ''}
                      onChange={(e) =>
                        updatePatient(index, 'email', e.target.value)
                      }
                      placeholder="email@example.com"
                      className="mt-1"
                    />
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      <div className="flex justify-end">
        <Button onClick={onNext} disabled={!canProceed || patients.length === 0}>
          Continue
        </Button>
      </div>
    </div>
  );
}

