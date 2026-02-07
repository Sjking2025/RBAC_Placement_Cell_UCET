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
  Award,
  Calendar,
  ExternalLink,
  Loader2
} from 'lucide-react';
import { formatDate } from '../../utils/helpers';
import api from '../../api/axios';
import toast from 'react-hot-toast';

const CertificationsSection = ({ certifications = [], onUpdate }) => {
  const [isAdding, setIsAdding] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    issuingOrganization: '',
    issueDate: '',
    expiryDate: '',
    credentialId: '',
    credentialUrl: ''
  });

  const resetForm = () => {
    setFormData({
      name: '',
      issuingOrganization: '',
      issueDate: '',
      expiryDate: '',
      credentialId: '',
      credentialUrl: ''
    });
    setIsAdding(false);
    setEditingId(null);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.name.trim()) {
      toast.error('Certification name is required');
      return;
    }

    setLoading(true);
    try {
      if (editingId) {
        await api.put(`/students/certifications/${editingId}`, formData);
        toast.success('Certification updated');
      } else {
        await api.post('/students/certifications', formData);
        toast.success('Certification added');
      }
      resetForm();
      onUpdate?.();
    } catch (error) {
      toast.error('Failed to save certification');
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = (cert) => {
    setFormData({
      name: cert.name || '',
      issuingOrganization: cert.issuing_organization || '',
      issueDate: cert.issue_date?.split('T')[0] || '',
      expiryDate: cert.expiry_date?.split('T')[0] || '',
      credentialId: cert.credential_id || '',
      credentialUrl: cert.credential_url || ''
    });
    setEditingId(cert.id);
    setIsAdding(true);
  };

  const handleDelete = async (certId) => {
    if (!confirm('Are you sure you want to delete this certification?')) return;
    try {
      await api.delete(`/students/certifications/${certId}`);
      toast.success('Certification deleted');
      onUpdate?.();
    } catch (error) {
      toast.error('Failed to delete certification');
    }
  };

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="flex items-center">
              <Award className="h-5 w-5 mr-2" />
              Certifications
            </CardTitle>
            <CardDescription>Add your professional certifications and courses</CardDescription>
          </div>
          {!isAdding && (
            <Button size="sm" onClick={() => setIsAdding(true)}>
              <Plus className="h-4 w-4 mr-1" />
              Add Certification
            </Button>
          )}
        </div>
      </CardHeader>
      <CardContent>
        {/* Add/Edit Form */}
        {isAdding && (
          <form onSubmit={handleSubmit} className="mb-6 p-4 border rounded-lg bg-muted/30">
            <div className="grid gap-4 md:grid-cols-2">
              <div className="space-y-2 md:col-span-2">
                <Label htmlFor="name">Certification Name *</Label>
                <Input
                  id="name"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  placeholder="e.g., AWS Solutions Architect"
                />
              </div>
              <div className="space-y-2 md:col-span-2">
                <Label htmlFor="issuingOrganization">Issuing Organization</Label>
                <Input
                  id="issuingOrganization"
                  value={formData.issuingOrganization}
                  onChange={(e) => setFormData({ ...formData, issuingOrganization: e.target.value })}
                  placeholder="e.g., Amazon Web Services"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="issueDate">Issue Date</Label>
                <Input
                  id="issueDate"
                  type="date"
                  value={formData.issueDate}
                  onChange={(e) => setFormData({ ...formData, issueDate: e.target.value })}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="expiryDate">Expiry Date (if applicable)</Label>
                <Input
                  id="expiryDate"
                  type="date"
                  value={formData.expiryDate}
                  onChange={(e) => setFormData({ ...formData, expiryDate: e.target.value })}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="credentialId">Credential ID</Label>
                <Input
                  id="credentialId"
                  value={formData.credentialId}
                  onChange={(e) => setFormData({ ...formData, credentialId: e.target.value })}
                  placeholder="e.g., ABC123XYZ"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="credentialUrl">Credential URL</Label>
                <Input
                  id="credentialUrl"
                  type="url"
                  value={formData.credentialUrl}
                  onChange={(e) => setFormData({ ...formData, credentialUrl: e.target.value })}
                  placeholder="https://..."
                />
              </div>
            </div>
            <div className="flex justify-end gap-2 mt-4">
              <Button type="button" variant="ghost" onClick={resetForm}>
                Cancel
              </Button>
              <Button type="submit" disabled={loading}>
                {loading && <Loader2 className="h-4 w-4 mr-1 animate-spin" />}
                {editingId ? 'Update' : 'Add'} Certification
              </Button>
            </div>
          </form>
        )}

        {/* Certifications List */}
        {certifications.length === 0 && !isAdding ? (
          <p className="text-center text-muted-foreground py-8">
            No certifications added yet. Add your certifications to stand out!
          </p>
        ) : (
          <div className="space-y-4">
            {certifications.map((cert) => (
              <div key={cert.id} className="p-4 border rounded-lg">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-2">
                      <Award className="h-5 w-5 text-primary" />
                      <h4 className="font-semibold">{cert.name}</h4>
                    </div>
                    {cert.issuing_organization && (
                      <p className="text-sm text-muted-foreground mt-1">
                        Issued by {cert.issuing_organization}
                      </p>
                    )}
                    <div className="flex flex-wrap items-center gap-4 mt-2 text-sm text-muted-foreground">
                      {cert.issue_date && (
                        <span className="flex items-center">
                          <Calendar className="h-3 w-3 mr-1" />
                          Issued: {formatDate(cert.issue_date)}
                        </span>
                      )}
                      {cert.expiry_date && (
                        <Badge variant={new Date(cert.expiry_date) < new Date() ? 'destructive' : 'outline'}>
                          Expires: {formatDate(cert.expiry_date)}
                        </Badge>
                      )}
                      {cert.credential_url && (
                        <a href={cert.credential_url} target="_blank" rel="noopener noreferrer" className="flex items-center hover:text-foreground">
                          <ExternalLink className="h-3 w-3 mr-1" />
                          View Credential
                        </a>
                      )}
                    </div>
                  </div>
                  <div className="flex gap-1">
                    <Button variant="ghost" size="icon" onClick={() => handleEdit(cert)}>
                      <Edit2 className="h-4 w-4" />
                    </Button>
                    <Button variant="ghost" size="icon" onClick={() => handleDelete(cert.id)}>
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

export default CertificationsSection;
