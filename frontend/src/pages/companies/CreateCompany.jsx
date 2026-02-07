import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Card, CardHeader, CardTitle, CardContent } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { Input } from '../../components/ui/Input';
import { Label } from '../../components/ui/Label';
import {
  ArrowLeft,
  Building2,
  Globe,
  MapPin,
  Upload,
  Loader2,
  Plus,
  Trash2
} from 'lucide-react';
import { INDUSTRY_TYPES } from '../../utils/constants';
import api from '../../api/axios';
import toast from 'react-hot-toast';

const schema = z.object({
  name: z.string().min(2, 'Company name is required'),
  industry: z.string().min(1, 'Industry is required'),
  description: z.string().optional(),
  website: z.string().url().optional().or(z.literal('')),
  address: z.string().optional(),
  city: z.string().optional(),
  state: z.string().optional(),
  headquarters: z.string().optional(),
  establishedYear: z.string().optional(),
  employeeCount: z.string().optional()
});

const CreateCompany = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [logoFile, setLogoFile] = useState(null);
  const [logoPreview, setLogoPreview] = useState(null);
  const [contacts, setContacts] = useState([
    { name: '', email: '', phone: '', designation: '', isPrimary: true }
  ]);

  const {
    register,
    handleSubmit,
    formState: { errors }
  } = useForm({
    resolver: zodResolver(schema),
    defaultValues: {
      name: '',
      industry: '',
      description: '',
      website: '',
      address: '',
      city: '',
      state: '',
      headquarters: '',
      establishedYear: '',
      employeeCount: ''
    }
  });

  const handleLogoChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setLogoFile(file);
      const reader = new FileReader();
      reader.onloadend = () => setLogoPreview(reader.result);
      reader.readAsDataURL(file);
    }
  };

  const addContact = () => {
    setContacts([...contacts, { name: '', email: '', phone: '', designation: '', isPrimary: false }]);
  };

  const removeContact = (index) => {
    if (contacts.length > 1) {
      setContacts(contacts.filter((_, i) => i !== index));
    }
  };

  const updateContact = (index, field, value) => {
    const updated = [...contacts];
    updated[index][field] = value;
    if (field === 'isPrimary' && value) {
      updated.forEach((c, i) => {
        if (i !== index) c.isPrimary = false;
      });
    }
    setContacts(updated);
  };

  const onSubmit = async (data) => {
    setLoading(true);
    try {
      const payload = {
        ...data,
        establishedYear: data.establishedYear ? parseInt(data.establishedYear) : null,
        employeeCount: data.employeeCount || null,
        contacts: contacts.filter(c => c.name && c.email)
      };

      const response = await api.post('/companies', payload);
      
      // Upload logo if selected
      if (logoFile && response.data.data?.id) {
        const formData = new FormData();
        formData.append('logo', logoFile);
        await api.post(`/companies/${response.data.data.id}/logo`, formData, {
          headers: { 'Content-Type': 'multipart/form-data' }
        });
      }

      toast.success('Company created successfully!');
      navigate('/companies');
    } catch (error) {
      const message = error.response?.data?.message || 'Failed to create company';
      toast.error(message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      <div className="flex items-center gap-4">
        <Button variant="ghost" onClick={() => navigate('/companies')}>
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back
        </Button>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
        {/* Basic Information */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <Building2 className="h-5 w-5 mr-2" />
              Company Information
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {/* Logo Upload */}
            <div className="flex items-center gap-6">
              <label className="flex-shrink-0 cursor-pointer">
                {logoPreview ? (
                  <img
                    src={logoPreview}
                    alt="Logo preview"
                    className="w-24 h-24 rounded-lg object-contain bg-muted"
                  />
                ) : (
                  <div className="w-24 h-24 rounded-lg bg-muted flex flex-col items-center justify-center text-muted-foreground hover:bg-muted/80 transition-colors">
                    <Upload className="h-6 w-6 mb-1" />
                    <span className="text-xs">Upload Logo</span>
                  </div>
                )}
                <input
                  type="file"
                  accept="image/*"
                  className="hidden"
                  onChange={handleLogoChange}
                />
              </label>
              <div className="flex-1 space-y-2">
                <Label htmlFor="name">Company Name *</Label>
                <Input id="name" {...register('name')} placeholder="e.g., Google" />
                {errors.name && <p className="text-sm text-destructive">{errors.name.message}</p>}
              </div>
            </div>

            <div className="grid gap-4 md:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="industry">Industry *</Label>
                <select
                  id="industry"
                  className="w-full h-10 rounded-md border border-input bg-background px-3 text-sm"
                  {...register('industry')}
                >
                  <option value="">Select industry</option>
                  {INDUSTRY_TYPES.map((type) => (
                    <option key={type.value} value={type.value}>{type.label}</option>
                  ))}
                </select>
                {errors.industry && <p className="text-sm text-destructive">{errors.industry.message}</p>}
              </div>
              <div className="space-y-2">
                <Label htmlFor="website">Website</Label>
                <div className="relative">
                  <Globe className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input id="website" className="pl-10" placeholder="https://..." {...register('website')} />
                </div>
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="description">Description</Label>
              <textarea
                id="description"
                rows={4}
                className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm resize-none"
                placeholder="Brief description about the company..."
                {...register('description')}
              />
            </div>

            <div className="grid gap-4 md:grid-cols-3">
              <div className="space-y-2">
                <Label htmlFor="establishedYear">Established Year</Label>
                <Input id="establishedYear" type="number" placeholder="e.g., 1998" {...register('establishedYear')} />
              </div>
              <div className="space-y-2">
                <Label htmlFor="employeeCount">Employee Count</Label>
                <select
                  id="employeeCount"
                  className="w-full h-10 rounded-md border border-input bg-background px-3 text-sm"
                  {...register('employeeCount')}
                >
                  <option value="">Select size</option>
                  <option value="1-50">1-50</option>
                  <option value="51-200">51-200</option>
                  <option value="201-500">201-500</option>
                  <option value="501-1000">501-1000</option>
                  <option value="1001-5000">1001-5000</option>
                  <option value="5000+">5000+</option>
                </select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="headquarters">Headquarters</Label>
                <Input id="headquarters" placeholder="e.g., San Francisco, CA" {...register('headquarters')} />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Location */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <MapPin className="h-5 w-5 mr-2" />
              Location
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="address">Address</Label>
              <Input id="address" placeholder="Street address" {...register('address')} />
            </div>
            <div className="grid gap-4 md:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="city">City</Label>
                <Input id="city" {...register('city')} />
              </div>
              <div className="space-y-2">
                <Label htmlFor="state">State</Label>
                <Input id="state" {...register('state')} />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Contacts */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle>Contact Persons</CardTitle>
            <Button type="button" variant="outline" size="sm" onClick={addContact}>
              <Plus className="h-4 w-4 mr-1" />
              Add Contact
            </Button>
          </CardHeader>
          <CardContent className="space-y-4">
            {contacts.map((contact, index) => (
              <div key={index} className="p-4 border rounded-lg space-y-4">
                <div className="flex items-center justify-between">
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={contact.isPrimary}
                      onChange={(e) => updateContact(index, 'isPrimary', e.target.checked)}
                      className="rounded border-input"
                    />
                    <span className="text-sm font-medium">Primary Contact</span>
                  </label>
                  {contacts.length > 1 && (
                    <Button type="button" variant="ghost" size="icon" onClick={() => removeContact(index)}>
                      <Trash2 className="h-4 w-4 text-destructive" />
                    </Button>
                  )}
                </div>
                <div className="grid gap-4 md:grid-cols-2">
                  <div className="space-y-2">
                    <Label>Name</Label>
                    <Input
                      value={contact.name}
                      onChange={(e) => updateContact(index, 'name', e.target.value)}
                      placeholder="Contact name"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Designation</Label>
                    <Input
                      value={contact.designation}
                      onChange={(e) => updateContact(index, 'designation', e.target.value)}
                      placeholder="e.g., HR Manager"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Email</Label>
                    <Input
                      type="email"
                      value={contact.email}
                      onChange={(e) => updateContact(index, 'email', e.target.value)}
                      placeholder="email@company.com"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Phone</Label>
                    <Input
                      type="tel"
                      value={contact.phone}
                      onChange={(e) => updateContact(index, 'phone', e.target.value)}
                      placeholder="+91 "
                    />
                  </div>
                </div>
              </div>
            ))}
          </CardContent>
        </Card>

        {/* Submit */}
        <div className="flex justify-end gap-4">
          <Button type="button" variant="outline" onClick={() => navigate('/companies')}>
            Cancel
          </Button>
          <Button type="submit" disabled={loading}>
            {loading && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
            Create Company
          </Button>
        </div>
      </form>
    </div>
  );
};

export default CreateCompany;
