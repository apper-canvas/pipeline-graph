import React, { useState, useEffect } from "react";
import SearchBar from "@/components/molecules/SearchBar";
import FilterDropdown from "@/components/molecules/FilterDropdown";
import Button from "@/components/atoms/Button";
import Avatar from "@/components/atoms/Avatar";
import Badge from "@/components/atoms/Badge";
import Loading from "@/components/ui/Loading";
import ErrorView from "@/components/ui/ErrorView";
import Empty from "@/components/ui/Empty";
import ContactDetailModal from "@/components/organisms/ContactDetailModal";
import QuickAddModal from "@/components/organisms/QuickAddModal";
import ApperIcon from "@/components/ApperIcon";
import { contactService } from "@/services/api/contactService";
import { dealService } from "@/services/api/dealService";
import { csvExportService } from "@/services/csvExportService";
import { format } from "date-fns";
import { toast } from "react-toastify";

const Contacts = () => {
  const [contacts, setContacts] = useState([]);
  const [filteredContacts, setFilteredContacts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCompanies, setSelectedCompanies] = useState([]);
  const [selectedTags, setSelectedTags] = useState([]);
const [selectedContact, setSelectedContact] = useState(null);
  const [isDetailModalOpen, setIsDetailModalOpen] = useState(false);
  const [isQuickAddOpen, setIsQuickAddOpen] = useState(false);

const [isExporting, setIsExporting] = useState(false);

  const loadContacts = async () => {
    try {
      setError("");
      setLoading(true);
      const data = await contactService.getAll();
      setContacts(data);
      setFilteredContacts(data);
    } catch (err) {
      setError(err.message || "Failed to load contacts");
    } finally {
      setLoading(false);
    }
  };
const handleExportContacts = async () => {
    try {
      setIsExporting(true);
      await contactService.exportToCSV(filteredContacts);
      toast.success(`Successfully exported ${filteredContacts.length} contacts to CSV`);
    } catch (err) {
      toast.error("Failed to export contacts");
      console.error("Export error:", err);
    } finally {
      setIsExporting(false);
    }
  };

  const handleAddContact = () => {
    setIsQuickAddOpen(true);
  };
  useEffect(() => {
    loadContacts();
  }, []);

  useEffect(() => {
    const filterContacts = async () => {
      try {
        const filters = {
          company: selectedCompanies,
          tags: selectedTags
        };
        const filtered = await contactService.search(searchQuery, filters);
        setFilteredContacts(filtered);
      } catch (err) {
        console.error("Filter error:", err);
        setFilteredContacts(contacts);
      }
    };

    filterContacts();
  }, [searchQuery, selectedCompanies, selectedTags, contacts]);

  const handleContactClick = (contact) => {
    setSelectedContact(contact);
    setIsDetailModalOpen(true);
  };

  const handleDeleteContact = async (contactId) => {
    if (!confirm("Are you sure you want to delete this contact?")) return;

    try {
      await contactService.delete(contactId);
      toast.success("Contact deleted successfully!");
      loadContacts();
    } catch (err) {
      toast.error("Failed to delete contact");
    }
  };

  const getUniqueCompanies = () => {
    const companies = [...new Set(contacts.map(c => c.company).filter(Boolean))];
    return companies.map(company => ({ label: company, value: company }));
  };

  const getUniqueTags = () => {
    const allTags = contacts.flatMap(c => c.tags || []);
    const uniqueTags = [...new Set(allTags)];
    return uniqueTags.map(tag => ({ label: tag, value: tag }));
  };

  if (loading) return <Loading />;
  if (error) return <ErrorView error={error} onRetry={loadContacts} />;

  return (
    <div className="space-y-6">
{/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Contacts</h1>
          <p className="text-gray-600 mt-1">
            {filteredContacts.length} of {contacts.length} contacts
          </p>
        </div>
        
        {/* Export Button */}
<div className="flex items-center gap-3">
          <Button
            onClick={handleAddContact}
            variant="primary"
            size="sm"
            icon="Plus"
          >
            Add Contact
          </Button>
          <Button
            onClick={handleExportContacts}
            disabled={isExporting || filteredContacts.length === 0}
            variant="outline"
            size="sm"
            icon={isExporting ? "Loader2" : "Download"}
            className={isExporting ? "animate-spin" : ""}
          >
            {isExporting ? "Exporting..." : "Export CSV"}
          </Button>
        </div>
      </div>

      {/* Filters */}
      <div className="flex flex-col lg:flex-row gap-4">
        <div className="flex-1">
          <SearchBar
            value={searchQuery}
            onChange={setSearchQuery}
            placeholder="Search contacts by name, email, company..."
            onClear={() => setSearchQuery("")}
          />
        </div>
        <div className="flex gap-3">
          <FilterDropdown
            label="Company"
            options={getUniqueCompanies()}
            value={selectedCompanies}
            onChange={setSelectedCompanies}
            multiple
            className="w-48"
          />
          <FilterDropdown
            label="Tags"
            options={getUniqueTags()}
            value={selectedTags}
            onChange={setSelectedTags}
            multiple
            className="w-48"
          />
        </div>
      </div>

      {/* Contacts List */}
      {filteredContacts.length === 0 ? (
        <Empty
          title="No contacts found"
          description="Try adjusting your search criteria or add new contacts."
          icon="Users"
        />
      ) : (
        <div className="bg-white rounded-lg shadow-card overflow-hidden">
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Contact
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Company & Position
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Tags
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Last Updated
                  </th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {filteredContacts.map((contact) => (
                  <tr key={contact.Id} className="hover:bg-gray-50 transition-colors">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <Avatar
                          fallback={`${contact.firstName} ${contact.lastName}`}
                          size="md"
                          className="mr-4"
                        />
                        <div>
                          <button
                            onClick={() => handleContactClick(contact)}
                            className="text-sm font-medium text-gray-900 hover:text-primary transition-colors"
                          >
                            {contact.firstName} {contact.lastName}
                          </button>
                          <div className="text-sm text-gray-500">{contact.email}</div>
                          {contact.phone && (
                            <div className="text-sm text-gray-500">{contact.phone}</div>
                          )}
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900">{contact.company || "—"}</div>
                      <div className="text-sm text-gray-500">{contact.position || "—"}</div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex flex-wrap gap-1">
                        {contact.tags && contact.tags.length > 0 ? (
                          contact.tags.slice(0, 3).map((tag, index) => (
                            <Badge key={index} variant="primary" className="text-xs">
                              {tag}
                            </Badge>
                          ))
                        ) : (
                          <span className="text-sm text-gray-400">No tags</span>
                        )}
                        {contact.tags && contact.tags.length > 3 && (
                          <Badge variant="default" className="text-xs">
                            +{contact.tags.length - 3}
                          </Badge>
                        )}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {format(new Date(contact.updatedAt), "MMM d, yyyy")}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                      <div className="flex justify-end space-x-2">
                        <button
                          onClick={() => handleContactClick(contact)}
                          className="text-primary hover:text-primary/80 p-1 rounded transition-colors"
                        >
                          <ApperIcon name="Eye" className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => handleDeleteContact(contact.Id)}
                          className="text-red-600 hover:text-red-800 p-1 rounded transition-colors"
                        >
                          <ApperIcon name="Trash2" className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Contact Detail Modal */}
<ContactDetailModal
        isOpen={isDetailModalOpen}
        onClose={() => setIsDetailModalOpen(false)}
        contact={selectedContact}
        onUpdate={loadContacts}
      />
      <QuickAddModal
        isOpen={isQuickAddOpen}
        onClose={() => setIsQuickAddOpen(false)}
        onSuccess={loadContacts}
      />
    </div>
  );
};

export default Contacts;