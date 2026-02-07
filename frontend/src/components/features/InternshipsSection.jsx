import { useState } from 'react';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '../ui/Card';
import { Button } from '../ui/Button';
import { Input } from '../ui/Input';
import { Label } from '../ui/Label';
import { Badge } from '../ui/Badge';
import {
  Plus,
  Edit2,
  Trash2,
  Building,
  Calendar,
  MapPin,
  DollarSign,
  Loader2
} from 'lucide-react';
import { formatDate, formatCurrency } from '../../utils/helpers';
import api from '../../api/axios';
import toast from 'react-hot-toast';

const InternshipsSection = ({ internships = [], onUpdate }) => {
  const [isAdding, setIsAdding] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    companyName: '',
    role: '',
    description: '',
    location: '',
    startDate: '',
    endDate: '',
    stipend: '',
    isCurrent: false
  });

  const resetForm = () => {
    setFormData({
      companyName: '',
      role: '',
      description: '',
      location: '',
      startDate: '',
      endDate: '',
      stipend: '',
      isCurrent: false
    });
    setIsAdding(false);
    setEditingId(null);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.companyName.trim() || !formData.role.trim()) {
      toast.error('Company name and role are required');
      return;
    }

    setLoading(true);
    try {
      const payload = {
        ...formData,
        stipend: formData.stipend ? parseFloat(formData.stipend) : null
      };

      if (editingId) {
        await api.put(`/students/internships/${editingId}`, payload);
        toast.success('Internship updated');
      } else {
        await api.post('/students/internships', payload);
        toast.success('Internship added');
      }
      resetForm();
      onUpdate?.();
    } catch (error) {
      toast.error('Failed to save internship');
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = (internship) => {
    setFormData({
      companyName: internship.company_name || '',
      role: internship.role || '',
      description: internship.description || '',
      location: internship.location || '',
      startDate: internship.start_date?.split('T')[0] || '',
      endDate: internship.end_date?.split('T')[0] || '',
      stipend: internship.stipend?.toString() || '',
      isCurrent: internship.is_current || false
    });
    setEditingId(internship.id);
    setIsAdding(true);
  };

  const handleDelete = async (internshipId) => {
    if (!confirm('Are you sure you want to delete this internship?')) return;
    try {
      await api.delete(`/students/internships/${internshipId}`);
      toast.success('Internship deleted');
      onUpdate?.();
    } catch (error) {
      toast.error('Failed to delete internship');
    }
  };

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="flex items-center">
              <Building className="h-5 w-5 mr-2" />
              Internships
            </CardTitle>
            <CardDescription>Add your internship experiences</CardDescription>
          </div>
          {!isAdding && (
            <Button size="sm" onClick={() => setIsAdding(true)}>
              <Plus className="h-4 w-4 mr-1" />
              Add Internship
            </Button>
          )}
        </div>
      </CardHeader>
      <CardContent>
        {/* Add/Edit Form */}
        {isAdding && (
          <form onSubmit={handleSubmit} className="mb-6 p-4 border rounded-lg bg-muted/30">
            <div className="grid gap-4 md:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="companyName">Company Name *</Label>
                <Input
                  id="companyName"
                  value={formData.companyName}
                  onChange={(e) => setFormData({ ...formData, companyName: e.target.value })}
                  placeholder="e.g., Google"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="role">Role/Position *</Label>
                <Input
                  id="role"
                  value={formData.role}
                  onChange={(e) => setFormData({ ...formData, role: e.target.value })}
                  placeholder="e.g., Software Engineering Intern"
                />
              </div>
              <div className="space-y-2 md:col-span-2">
                <Label htmlFor="description">Description</Label>
                <textarea
                  id="description"
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  placeholder="Describe your responsibilities and achievements..."
                  className="w-full h-20 rounded-md border border-input bg-background px-3 py-2 text-sm resize-none"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="location">Location</Label>
                <Input
                  id="location"
                  value={formData.location}
                  onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                  placeholder="e.g., Bangalore, KA"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="stipend">Monthly Stipend (₹)</Label>
                <Input
                  id="stipend"
                  type="number"
                  value={formData.stipend}
                  onChange={(e) => setFormData({ ...formData, stipend: e.target.value })}
                  placeholder="e.g., 50000"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="startDate">Start Date</Label>
                <Input
                  id="startDate"
                  type="date"
                  value={formData.startDate}
                  onChange={(e) => setFormData({ ...formData, startDate: e.target.value })}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="endDate">End Date</Label>
                <Input
                  id="endDate"
                  type="date"
                  value={formData.endDate}
                  onChange={(e) => setFormData({ ...formData, endDate: e.target.value })}
                  disabled={formData.isCurrent}
                />
              </div>
              <div className="md:col-span-2">
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={formData.isCurrent}
                    onChange={(e) => setFormData({ ...formData, isCurrent: e.target.checked, endDate: '' })}
                    className="rounded border-input"
                  />
                  <span className="text-sm">I am currently working here</span>
                </label>
              </div>
            </div>
            <div className="flex justify-end gap-2 mt-4">
              <Button type="button" variant="ghost" onClick={resetForm}>
                Cancel
              </Button>
              <Button type="submit" disabled={loading}>
                {loading && <Loader2 className="h-4 w-4 mr-1 animate-spin" />}
                {editingId ? 'Update' : 'Add'} Internship
              </Button>
            </div>
          </form>
        )}

        {/* Internships List */}
        {internships.length === 0 && !isAdding ? (
          <p className="text-center text-muted-foreground py-8">
            No internships added yet. Add your internship experiences to boost your profile!
          </p>
        ) : (
          <div className="space-y-4">
            {internships.map((internship) => (
              <div key={internship.id} className="p-4 border rounded-lg">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-2">
                      <h4 className="font-semibold">{internship.role}</h4>
                      {internship.is_current && (
                        <Badge variant="success">Current</Badge>
                      )}
                    </div>
                    <p className="text-sm text-muted-foreground flex items-center mt-1">
                      <Building className="h-3 w-3 mr-1" />
                      {internship.company_name}
                    </p>
                    {internship.description && (
                      <p className="text-sm text-muted-foreground mt-2">
                        {internship.description}
                      </p>
                    )}
                    <div className="flex flex-wrap items-center gap-4 mt-2 text-sm text-muted-foreground">
                      {internship.location && (
                        <span className="flex items-center">
                          <MapPin className="h-3 w-3 mr-1" />
                          {internship.location}
                        </span>
                      )}
                      <span className="flex items-center">
                        <Calendar className="h-3 w-3 mr-1" />
                        {formatDate(internship.start_date)} - {internship.is_current ? 'Present' : formatDate(internship.end_date)}
                      </span>
                      {internship.stipend && (
                        <span className="flex items-center">
                          <DollarSign className="h-3 w-3 mr-1" />
                          ₹{internship.stipend.toLocaleString()}/month
                        </span>
                      )}
                    </div>
                  </div>
                  <div className="flex gap-1">
                    <Button variant="ghost" size="icon" onClick={() => handleEdit(internship)}>
                      <Edit2 className="h-4 w-4" />
                    </Button>
                    <Button variant="ghost" size="icon" onClick={() => handleDelete(internship.id)}>
                      <Trash2 className="h-4 w-4 text-destructive" />
                    </Button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default InternshipsSection;
