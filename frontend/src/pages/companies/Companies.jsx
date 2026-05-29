import { useEffect, useState } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { companiesApi } from '../../api/companiesApi';
import { Card, CardContent } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { Input } from '../../components/ui/Input';
import { Badge } from '../../components/ui/Badge';
import {
  Search,
  Filter,
  Building2,
  MapPin,
  Globe,
  Plus,
  ChevronLeft,
  ChevronRight,
  Loader2,
  Briefcase
} from 'lucide-react';
import { formatStatus, cn } from '../../utils/helpers';

const Companies = () => {
  const { isAdmin, isOfficer, isCoordinator } = useAuth();
  const [searchParams, setSearchParams] = useSearchParams();
  
  const [companies, setCompanies] = useState([]);
  const [loading, setLoading] = useState(true);
  const [pagination, setPagination] = useState({ page: 1, limit: 12, total: 0 });
  
  const [search, setSearch] = useState(searchParams.get('search') || '');
  const [status, setStatus] = useState(searchParams.get('status') || '');

  useEffect(() => {
    loadCompanies();
  }, [searchParams]);

  const loadCompanies = async () => {
    setLoading(true);
    try {
      const params = {
        page: searchParams.get('page') || 1,
        limit: 12,
        search: searchParams.get('search') || undefined,
        status: searchParams.get('status') || undefined
      };

      const response = await companiesApi.getAll(params);
      setCompanies(response.data || []);
      setPagination(response.pagination || { page: 1, limit: 12, total: 0 });
    } catch (error) {
      console.error('Failed to load companies:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = (e) => {
    e.preventDefault();
    const params = new URLSearchParams(searchParams);
    if (search) {
      params.set('search', search);
    } else {
      params.delete('search');
    }
    params.set('page', '1');
    setSearchParams(params);
  };

  const handlePageChange = (newPage) => {
    const params = new URLSearchParams(searchParams);
    params.set('page', newPage.toString());
    setSearchParams(params);
  };

  const totalPages = Math.ceil(pagination.total / pagination.limit);
  const canCreate = isAdmin() || isOfficer() || isCoordinator();

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 animate-stagger-in">
        <div>
          <h1 className="font-display text-2xl sm:text-3xl font-bold">Companies</h1>
          <p className="text-sm text-muted-foreground mt-1">
            Browse partner companies and their job openings
          </p>
        </div>
        {canCreate && (
          <Link to="/companies/new">
            <Button>
              <Plus className="h-4 w-4 mr-2" />
              Add Company
            </Button>
          </Link>
        )}
      </div>

      {/* Search */}
      <Card>
        <CardContent className="p-4">
          <form onSubmit={handleSearch} className="flex flex-col sm:flex-row gap-2">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search companies..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="pl-10"
              />
            </div>
            <select
              value={status}
              onChange={(e) => {
                setStatus(e.target.value);
                const params = new URLSearchParams(searchParams);
                if (e.target.value) {
                  params.set('status', e.target.value);
                } else {
                  params.delete('status');
                }
                params.set('page', '1');
                setSearchParams(params);
              }}
              className="h-10 w-full sm:w-auto rounded-lg border border-input bg-background/50 px-3 text-sm transition-all duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring/30"
            >
              <option value="">All Status</option>
              <option value="active">Active</option>
              <option value="approved">Approved</option>
              <option value="pending">Pending</option>
            </select>
            <Button type="submit" className="w-full sm:w-auto">Search</Button>
          </form>
        </CardContent>
      </Card>

      {/* Companies Grid */}
      {loading ? (
        <div className="flex items-center justify-center py-12">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      ) : companies.length === 0 ? (
        <Card>
          <CardContent className="py-12 text-center">
            <Building2 className="h-10 w-10 mx-auto text-muted-foreground/30 mb-3" />
            <h3 className="font-display text-base font-medium">No companies found</h3>
            <p className="text-muted-foreground">
              Try adjusting your search or filters
            </p>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {companies.map((company) => (
            <Link key={company.id} to={`/companies/${company.id}`}>
              <Card className="h-full hover:border-primary/30 hover-lift transition-all duration-300">
                <CardContent className="p-5">
                  <div className="flex items-start gap-4">
                    <div className="w-14 h-14 rounded-xl bg-primary/10 flex items-center justify-center flex-shrink-0">
                      {company.logo_url ? (
                        <img 
                          src={company.logo_url} 
                          alt={company.name}
                          className="w-12 h-12 object-contain"
                        />
                      ) : (
                        <Building2 className="h-8 w-8 text-muted-foreground" />
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <h3 className="font-display font-semibold text-sm truncate">{company.name}</h3>
                      <p className="text-xs text-muted-foreground">{company.industry}</p>
                    </div>
                  </div>

                  <div className="mt-4 space-y-2">
                    {company.city && (
                      <p className="text-sm text-muted-foreground flex items-center">
                        <MapPin className="h-4 w-4 mr-1 flex-shrink-0" />
                        {company.city}, {company.state}
                      </p>
                    )}
                    {company.website && (
                      <p className="text-sm text-muted-foreground flex items-center">
                        <Globe className="h-4 w-4 mr-1 flex-shrink-0" />
                        <span className="truncate">{company.website.replace(/^https?:\/\//, '')}</span>
                      </p>
                    )}
                  </div>

                  <div className="flex items-center justify-between mt-4 pt-3 border-t border-border/50">
                    <Badge variant={company.status === 'active' ? 'success' : 'secondary'}>
                      {formatStatus(company.status)}
                    </Badge>
                    <span className="text-sm text-muted-foreground flex items-center">
                      <Briefcase className="h-4 w-4 mr-1" />
                      {company._count?.job_postings || 0} jobs
                    </span>
                  </div>
                </CardContent>
              </Card>
            </Link>
          ))}
        </div>
      )}

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex items-center justify-center gap-2">
          <Button
            variant="outline"
            size="sm"
            disabled={pagination.page <= 1}
            onClick={() => handlePageChange(pagination.page - 1)}
          >
            <ChevronLeft className="h-4 w-4" />
          </Button>
          <span className="text-xs text-muted-foreground">
            Page {pagination.page} of {totalPages}
          </span>
          <Button
            variant="outline"
            size="sm"
            disabled={pagination.page >= totalPages}
            onClick={() => handlePageChange(pagination.page + 1)}
          >
            <ChevronRight className="h-4 w-4" />
          </Button>
        </div>
      )}
    </div>
  );
};

export default Companies;
