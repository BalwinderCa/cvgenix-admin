"use client";
import { useState, useEffect } from "react";
import Card from "@/components/ui/Card";
import Button from "@/components/ui/Button";
import Icon from "@/components/ui/Icon";
import Textinput from "@/components/ui/Textinput";

export default function TemplateSidebar({
  currentTemplateId,
  onTemplateSelect,
  canvasReady = false,
}) {
  const [templates, setTemplates] = useState([]);
  const [filteredTemplates, setFilteredTemplates] = useState([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [loading, setLoading] = useState(true);

  const categories = ["all", "Professional", "Creative", "Minimalist", "Modern", "Classic", "Executive"];

  useEffect(() => {
    loadTemplates();
  }, []);

  useEffect(() => {
    filterTemplates();
  }, [templates, searchQuery, selectedCategory]);

  const loadTemplates = async () => {
    try {
      const response = await fetch("/api/templates");
      if (response.ok) {
        const data = await response.json();
        console.log("Templates loaded:", data.data);
        setTemplates(data.data || []);
      } else {
        console.log("API failed");
        setTemplates([]);
      }
    } catch (error) {
      console.error("Error loading templates:", error);
      setTemplates([]);
    } finally {
      setLoading(false);
    }
  };

  const filterTemplates = () => {
    let filtered = templates;

    // Search filter
    if (searchQuery) {
      filtered = filtered.filter(
        (template) =>
          template.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
          (template.description &&
            template.description.toLowerCase().includes(searchQuery.toLowerCase()))
      );
    }

    // Category filter
    if (selectedCategory !== "all") {
      filtered = filtered.filter(
        (template) => template.category === selectedCategory
      );
    }

    setFilteredTemplates(filtered);
  };

  const handleTemplateClick = (templateId) => {
    console.log("Template clicked in sidebar:", templateId);
    onTemplateSelect(templateId);
  };

  return (
    <div className="w-full h-full flex flex-col overflow-hidden">
      {/* Header */}
      <div className="p-4 border-b border-gray-200 flex-shrink-0">
        <div className="mb-4">
          <h3 className="font-medium text-gray-900 text-sm">Templates</h3>
          <p className="text-xs text-gray-500">Choose a template to get started</p>
        </div>

        {/* Search */}
        <div className="relative mb-4">
          <Icon
            icon="heroicons:magnifying-glass"
            className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400"
          />
          <Textinput
            placeholder="Search templates..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10 h-9 text-sm"
          />
        </div>

        {/* Category Filter */}
        <div className="space-y-2">
          <div className="flex items-center gap-2">
            <Icon icon="heroicons:funnel" className="h-4 w-4 text-gray-600" />
            <span className="text-xs font-medium text-gray-600">Category:</span>
          </div>
          <div className="flex flex-wrap gap-1">
            {categories.map((category) => (
              <button
                key={category}
                onClick={() => setSelectedCategory(category)}
                className={`text-xs px-2 py-1 rounded ${
                  selectedCategory === category
                    ? "bg-primary-500 hover:bg-primary-600 text-white"
                    : "border border-gray-300 text-gray-700 hover:bg-gray-50"
                }`}
              >
                {category.charAt(0).toUpperCase() + category.slice(1)}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Templates Grid */}
      <div className="flex-1 overflow-y-auto p-4">
        {loading ? (
          <div className="flex items-center justify-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-500"></div>
          </div>
        ) : filteredTemplates.length === 0 ? (
          <div className="text-center py-12">
            <Icon icon="heroicons:palette" className="h-16 w-16 mx-auto text-gray-400 mb-4" />
            <h3 className="text-lg font-semibold text-gray-900 mb-2">No templates found</h3>
            <p className="text-gray-600 mb-4">
              Try adjusting your search criteria or filters.
            </p>
            <Button
              text="Clear Filters"
              className="btn-secondary"
              onClick={() => {
                setSearchQuery("");
                setSelectedCategory("all");
              }}
            />
          </div>
        ) : (
          <div className="grid grid-cols-2 gap-4">
            {filteredTemplates.map((template) => (
              <div
                key={template._id}
                className={`group hover:shadow-xl transition-all duration-300 border rounded-lg shadow-lg bg-white cursor-pointer ${
                  currentTemplateId === template._id
                    ? "ring-2 ring-primary-500 bg-primary-50"
                    : "hover:border-primary-300"
                }`}
                onClick={() => handleTemplateClick(template._id)}
              >
                <div className="relative overflow-hidden">
                  {/* Template Preview */}
                  <div className="aspect-[3/4] bg-white rounded-t-lg overflow-hidden border border-gray-200">
                    {template.thumbnail &&
                    template.thumbnail.startsWith("data:image") ? (
                      <img
                        src={template.thumbnail}
                        alt={`${template.name} template preview`}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <div className="w-full h-full bg-white flex items-center justify-center">
                        <div className="text-center p-4">
                          <div className="text-lg font-bold text-gray-900 mb-2">
                            {template.name || "TEMPLATE"}
                          </div>
                          <div className="text-sm text-gray-600 mb-1">
                            {template.category || "PROFESSIONAL"}
                          </div>
                          <div className="text-xs text-gray-500">
                            {template.description || "Template preview"}
                          </div>
                        </div>
                      </div>
                    )}
                  </div>

                  {template.isPremium && (
                    <div className="absolute top-2 right-2 bg-yellow-500 text-white font-semibold text-xs px-2 py-1 rounded flex items-center">
                      <Icon icon="heroicons:crown" className="w-3 h-3 mr-1" />
                      Premium
                    </div>
                  )}

                  {/* Current Template Indicator */}
                  {currentTemplateId === template._id && (
                    <div className="absolute top-2 left-2">
                      <div className="w-5 h-5 bg-primary-500 rounded-full flex items-center justify-center">
                        <Icon icon="heroicons:check" className="h-3 w-3 text-white" />
                      </div>
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Footer */}
      <div className="h-12 border-t border-gray-200 bg-gray-50 flex-shrink-0 flex items-center justify-center">
        <div className="text-xs text-gray-500">
          {filteredTemplates.length} template
          {filteredTemplates.length !== 1 ? "s" : ""} found
        </div>
      </div>
    </div>
  );
}

