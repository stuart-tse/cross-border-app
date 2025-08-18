'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { 
  Car, 
  Plus, 
  Search, 
  Filter, 
  AlertTriangle, 
  CheckCircle,
  Clock,
  RefreshCw,
  Loader2 
} from 'lucide-react';
import { VehicleType } from '@prisma/client';
import VehicleCard from './VehicleCard';
import VehicleRegistrationForm from '@/components/forms/VehicleRegistrationForm';

interface Vehicle {
  id: string;
  make: string;
  model: string;
  year: number;
  color: string;
  plateNumber: string;
  vin?: string;
  vehicleType: VehicleType;
  capacity: number;
  isActive: boolean;
  features: string[];
  fuelType?: string;
  specialEquipment: string[];
  insuranceExpiry: string;
  inspectionExpiry: string;
  photos: string[];
  hasExpiringDocuments: boolean;
  permits: any[];
  licenses: any[];
  expiringPermits?: any[];
  expiringLicenses?: any[];
}

interface VehicleStats {
  totalVehicles: number;
  activeVehicles: number;
  expiringDocuments: number;
  expiredDocuments: number;
}

export default function VehicleManagement() {
  const [vehicles, setVehicles] = useState<Vehicle[]>([]);
  const [stats, setStats] = useState<VehicleStats>({
    totalVehicles: 0,
    activeVehicles: 0,
    expiringDocuments: 0,
    expiredDocuments: 0,
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterType, setFilterType] = useState<string>('all');
  const [filterStatus, setFilterStatus] = useState<string>('all');
  const [showAddForm, setShowAddForm] = useState(false);

  // Load vehicles
  const loadVehicles = async () => {
    try {
      setLoading(true);
      setError(null);

      const response = await fetch('/api/drivers/vehicles');
      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to load vehicles');
      }

      setVehicles(data.vehicles);
      
      // Calculate stats
      const totalVehicles = data.vehicles.length;
      const activeVehicles = data.vehicles.filter((v: Vehicle) => v.isActive).length;
      const expiringDocuments = data.vehicles.filter((v: Vehicle) => v.hasExpiringDocuments).length;
      
      // Count expired documents
      const now = new Date();
      const expiredDocuments = data.vehicles.filter((v: Vehicle) => {
        const insuranceExpired = new Date(v.insuranceExpiry) < now;
        const inspectionExpired = new Date(v.inspectionExpiry) < now;
        const expiredPermits = v.permits.some((p: any) => new Date(p.expiryDate) < now);
        const expiredLicenses = v.licenses.some((l: any) => new Date(l.expiryDate) < now);
        
        return insuranceExpired || inspectionExpired || expiredPermits || expiredLicenses;
      }).length;

      setStats({
        totalVehicles,
        activeVehicles,
        expiringDocuments,
        expiredDocuments,
      });
    } catch (err: any) {
      console.error('Error loading vehicles:', err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadVehicles();
  }, []);

  // Filter vehicles based on search term and filters
  const filteredVehicles = vehicles.filter(vehicle => {
    const matchesSearch = 
      vehicle.make.toLowerCase().includes(searchTerm.toLowerCase()) ||
      vehicle.model.toLowerCase().includes(searchTerm.toLowerCase()) ||
      vehicle.plateNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (vehicle.vin && vehicle.vin.toLowerCase().includes(searchTerm.toLowerCase()));

    const matchesType = filterType === 'all' || vehicle.vehicleType === filterType;

    const matchesStatus = 
      filterStatus === 'all' ||
      (filterStatus === 'active' && vehicle.isActive) ||
      (filterStatus === 'inactive' && !vehicle.isActive) ||
      (filterStatus === 'expiring' && vehicle.hasExpiringDocuments);

    return matchesSearch && matchesType && matchesStatus;
  });

  const handleVehicleAdded = (vehicle: Vehicle) => {
    setShowAddForm(false);
    loadVehicles();
  };

  const handleEdit = (vehicle: Vehicle) => {
    // TODO: Implement edit functionality
    console.log('Edit vehicle:', vehicle.id);
  };

  const handleDelete = async (vehicleId: string) => {
    if (!confirm('Are you sure you want to delete this vehicle? This action cannot be undone.')) {
      return;
    }

    try {
      const response = await fetch(`/api/drivers/vehicles/${vehicleId}`, {
        method: 'DELETE',
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || 'Failed to delete vehicle');
      }

      loadVehicles();
    } catch (err: any) {
      console.error('Error deleting vehicle:', err);
      alert(`Failed to delete vehicle: ${err.message}`);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center p-8">
        <Loader2 className="h-8 w-8 animate-spin" />
        <span className="ml-2">Loading vehicles...</span>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-semibold">Vehicle Management</h2>
          <p className="text-gray-600 mt-1">
            Manage your vehicles, permits, and licenses
          </p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={loadVehicles} disabled={loading}>
            <RefreshCw className={`h-4 w-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
            Refresh
          </Button>
          <Dialog open={showAddForm} onOpenChange={setShowAddForm}>
            <DialogTrigger asChild>
              <Button>
                <Plus className="h-4 w-4 mr-2" />
                Add Vehicle
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
              <DialogHeader>
                <DialogTitle>Register New Vehicle</DialogTitle>
              </DialogHeader>
              <VehicleRegistrationForm onSuccess={handleVehicleAdded} />
            </DialogContent>
          </Dialog>
        </div>
      </div>

      {/* Error Alert */}
      {error && (
        <Alert variant="destructive">
          <AlertTriangle className="h-4 w-4" />
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      {/* Stats Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-blue-100 rounded-lg">
                <Car className="h-5 w-5 text-blue-600" />
              </div>
              <div>
                <p className="text-sm text-gray-600">Total Vehicles</p>
                <p className="text-2xl font-semibold">{stats.totalVehicles}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-green-100 rounded-lg">
                <CheckCircle className="h-5 w-5 text-green-600" />
              </div>
              <div>
                <p className="text-sm text-gray-600">Active Vehicles</p>
                <p className="text-2xl font-semibold">{stats.activeVehicles}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-orange-100 rounded-lg">
                <Clock className="h-5 w-5 text-orange-600" />
              </div>
              <div>
                <p className="text-sm text-gray-600">Expiring Soon</p>
                <p className="text-2xl font-semibold">{stats.expiringDocuments}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-red-100 rounded-lg">
                <AlertTriangle className="h-5 w-5 text-red-600" />
              </div>
              <div>
                <p className="text-sm text-gray-600">Expired</p>
                <p className="text-2xl font-semibold">{stats.expiredDocuments}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Search and Filters */}
      <Card>
        <CardContent className="p-4">
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                <Input
                  placeholder="Search vehicles by make, model, plate number, or VIN..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>
            <div className="flex gap-2">
              <Select value={filterType} onValueChange={setFilterType}>
                <SelectTrigger className="w-40">
                  <SelectValue placeholder="All Types" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Types</SelectItem>
                  <SelectItem value={VehicleType.BUSINESS}>Business</SelectItem>
                  <SelectItem value={VehicleType.EXECUTIVE}>Executive</SelectItem>
                  <SelectItem value={VehicleType.LUXURY}>Luxury</SelectItem>
                  <SelectItem value={VehicleType.SUV}>SUV</SelectItem>
                  <SelectItem value={VehicleType.VAN}>Van</SelectItem>
                </SelectContent>
              </Select>

              <Select value={filterStatus} onValueChange={setFilterStatus}>
                <SelectTrigger className="w-40">
                  <SelectValue placeholder="All Status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Status</SelectItem>
                  <SelectItem value="active">Active</SelectItem>
                  <SelectItem value="inactive">Inactive</SelectItem>
                  <SelectItem value="expiring">Expiring Documents</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          
          {(searchTerm || filterType !== 'all' || filterStatus !== 'all') && (
            <div className="flex items-center gap-2 mt-2">
              <span className="text-sm text-gray-600">
                Showing {filteredVehicles.length} of {vehicles.length} vehicles
              </span>
              {(searchTerm || filterType !== 'all' || filterStatus !== 'all') && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => {
                    setSearchTerm('');
                    setFilterType('all');
                    setFilterStatus('all');
                  }}
                >
                  Clear filters
                </Button>
              )}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Vehicles Grid */}
      {filteredVehicles.length === 0 ? (
        <Card>
          <CardContent className="p-8 text-center">
            <Car className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">
              {vehicles.length === 0 ? 'No vehicles registered' : 'No vehicles match your filters'}
            </h3>
            <p className="text-gray-600 mb-4">
              {vehicles.length === 0 
                ? 'Get started by registering your first vehicle.'
                : 'Try adjusting your search terms or filters.'}
            </p>
            {vehicles.length === 0 && (
              <Button onClick={() => setShowAddForm(true)}>
                <Plus className="h-4 w-4 mr-2" />
                Add Your First Vehicle
              </Button>
            )}
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
          {filteredVehicles.map(vehicle => (
            <VehicleCard
              key={vehicle.id}
              vehicle={vehicle}
              onEdit={handleEdit}
              onDelete={handleDelete}
              onRefresh={loadVehicles}
            />
          ))}
        </div>
      )}
    </div>
  );
}