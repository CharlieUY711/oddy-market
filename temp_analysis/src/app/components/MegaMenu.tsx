import { useState, useEffect } from "react";
import { ChevronDown, ChevronRight, X } from "lucide-react";
import { motion, AnimatePresence } from "motion/react";
import { projectId, publicAnonKey } from "/utils/supabase/info";

interface Subcategory {
  id: string;
  name: string;
}

interface Category {
  id: string;
  name: string;
  subcategories: Subcategory[];
}

interface Department {
  id: string;
  name: string;
  icon: string;
  categories: Category[];
  visible?: boolean;
}

interface MegaMenuProps {
  onCategorySelect: (department: string, category?: string, subcategory?: string) => void;
}

export function MegaMenu({ onCategorySelect }: MegaMenuProps) {
  const [departments, setDepartments] = useState<Department[]>([]);
  const [hoveredDept, setHoveredDept] = useState<string | null>(null);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [expandedMobileDept, setExpandedMobileDept] = useState<string | null>(null);
  const [expandedMobileCat, setExpandedMobileCat] = useState<string | null>(null);

  useEffect(() => {
    loadDepartments();
  }, []);

  async function loadDepartments() {
    try {
      const response = await fetch(
        `https://${projectId}.supabase.co/functions/v1/make-server-0dd48dc4/departments`,
        {
          headers: {
            Authorization: `Bearer ${publicAnonKey}`,
          },
        }
      );

      if (response.ok) {
        const data = await response.json();
        setDepartments(data.departments?.filter((d: Department) => d.visible !== false) || []);
      }
    } catch (error) {
      console.error("Error loading departments:", error);
    }
  }

  function handleCategoryClick(dept: string, category?: string, subcategory?: string) {
    onCategorySelect(dept, category, subcategory);
    setHoveredDept(null);
    setIsMobileMenuOpen(false);
  }

  return (
    <>
      {/* Desktop Mega Menu */}
      <div className="hidden lg:block bg-white border-b border-border">
        <div className="container mx-auto">
          <div className="flex items-center overflow-x-auto">
            {departments.map((dept, deptIndex) => (
              <div
                key={`desktop-${dept.id}-${deptIndex}`}
                className="relative"
                onMouseEnter={() => setHoveredDept(dept.id)}
                onMouseLeave={() => setHoveredDept(null)}
              >
                <button
                  onClick={() => handleCategoryClick(dept.name)}
                  className={`flex items-center gap-2 px-4 py-3 whitespace-nowrap transition-colors ${
                    hoveredDept === dept.id
                      ? "bg-primary text-white"
                      : "hover:bg-muted"
                  }`}
                >
                  <span>{dept.icon}</span>
                  <span className="font-medium">{dept.name}</span>
                  {dept.categories.length > 0 && (
                    <ChevronDown className="w-4 h-4" />
                  )}
                </button>

                {/* Dropdown */}
                <AnimatePresence>
                  {hoveredDept === dept.id && dept.categories.length > 0 && (
                    <motion.div
                      initial={{ opacity: 0, y: -10 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -10 }}
                      transition={{ duration: 0.2 }}
                      className="absolute left-0 top-full z-50 bg-white border border-border rounded-lg shadow-xl mt-1 min-w-[800px] max-w-[1000px]"
                    >
                      <div className="p-6">
                        <div className="grid grid-cols-3 gap-6">
                          {dept.categories.map((category, catIndex) => (
                            <div key={`${dept.id}-cat-${category.id}-${catIndex}`} className="space-y-2">
                              <button
                                onClick={() =>
                                  handleCategoryClick(dept.name, category.name)
                                }
                                className="font-bold text-primary hover:text-primary/80 transition-colors text-left w-full"
                              >
                                {category.name}
                              </button>
                              {category.subcategories.length > 0 && (
                                <div className="space-y-1 pl-2">
                                  {category.subcategories.map((sub, subIndex) => (
                                    <button
                                      key={`${dept.id}-${category.id}-sub-${sub.id}-${subIndex}`}
                                      onClick={() =>
                                        handleCategoryClick(
                                          dept.name,
                                          category.name,
                                          sub.name
                                        )
                                      }
                                      className="block text-sm text-muted-foreground hover:text-foreground transition-colors text-left w-full py-1"
                                    >
                                      {sub.name}
                                    </button>
                                  ))}
                                </div>
                              )}
                            </div>
                          ))}
                        </div>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Mobile Menu Button */}
      <div className="lg:hidden bg-white border-b border-border">
        <button
          onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
          className="w-full flex items-center justify-between px-4 py-3 font-medium"
        >
          <span>📂 Todos los Departamentos</span>
          <ChevronDown
            className={`w-5 h-5 transition-transform ${
              isMobileMenuOpen ? "rotate-180" : ""
            }`}
          />
        </button>
      </div>

      {/* Mobile Menu Drawer */}
      <AnimatePresence>
        {isMobileMenuOpen && (
          <>
            {/* Backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsMobileMenuOpen(false)}
              className="fixed inset-0 bg-black/50 z-40 lg:hidden"
            />

            {/* Drawer */}
            <motion.div
              initial={{ x: "-100%" }}
              animate={{ x: 0 }}
              exit={{ x: "-100%" }}
              transition={{ type: "spring", damping: 25 }}
              className="fixed left-0 top-0 bottom-0 w-[85%] max-w-sm bg-white z-50 overflow-y-auto lg:hidden"
            >
              <div className="sticky top-0 bg-white border-b border-border p-4 flex items-center justify-between z-10">
                <h2 className="font-bold text-lg">Departamentos</h2>
                <button
                  onClick={() => setIsMobileMenuOpen(false)}
                  className="p-2 hover:bg-muted rounded-lg transition-colors"
                >
                  <X className="w-6 h-6" />
                </button>
              </div>

              <div className="p-2">
                {departments.map((dept, deptMobileIndex) => (
                  <div key={`mobile-${dept.id}-${deptMobileIndex}`} className="border-b border-border last:border-0">
                    <button
                      onClick={() => {
                        if (dept.categories.length === 0) {
                          handleCategoryClick(dept.name);
                        } else {
                          setExpandedMobileDept(
                            expandedMobileDept === dept.id ? null : dept.id
                          );
                        }
                      }}
                      className="w-full flex items-center justify-between p-3 hover:bg-muted transition-colors"
                    >
                      <div className="flex items-center gap-3">
                        <span className="text-2xl">{dept.icon}</span>
                        <span className="font-medium">{dept.name}</span>
                      </div>
                      {dept.categories.length > 0 && (
                        <ChevronRight
                          className={`w-5 h-5 transition-transform ${
                            expandedMobileDept === dept.id ? "rotate-90" : ""
                          }`}
                        />
                      )}
                    </button>

                    {/* Categories */}
                    <AnimatePresence>
                      {expandedMobileDept === dept.id && (
                        <motion.div
                          initial={{ height: 0 }}
                          animate={{ height: "auto" }}
                          exit={{ height: 0 }}
                          className="overflow-hidden bg-muted/30"
                        >
                          {dept.categories.map((category, catMobileIndex) => (
                            <div key={`mobile-${dept.id}-cat-${category.id}-${catMobileIndex}`}>
                              <button
                                onClick={() => {
                                  if (category.subcategories.length === 0) {
                                    handleCategoryClick(dept.name, category.name);
                                  } else {
                                    setExpandedMobileCat(
                                      expandedMobileCat === category.id
                                        ? null
                                        : category.id
                                    );
                                  }
                                }}
                                className="w-full flex items-center justify-between px-6 py-2 hover:bg-muted transition-colors text-left"
                              >
                                <span className="font-medium text-sm">
                                  {category.name}
                                </span>
                                {category.subcategories.length > 0 && (
                                  <ChevronRight
                                    className={`w-4 h-4 transition-transform ${
                                      expandedMobileCat === category.id
                                        ? "rotate-90"
                                        : ""
                                    }`}
                                  />
                                )}
                              </button>

                              {/* Subcategories */}
                              <AnimatePresence>
                                {expandedMobileCat === category.id && (
                                  <motion.div
                                    initial={{ height: 0 }}
                                    animate={{ height: "auto" }}
                                    exit={{ height: 0 }}
                                    className="overflow-hidden bg-muted/50"
                                  >
                                    {category.subcategories.map((sub, subMobileIndex) => (
                                      <button
                                        key={`mobile-${dept.id}-${category.id}-sub-${sub.id}-${subMobileIndex}`}
                                        onClick={() =>
                                          handleCategoryClick(
                                            dept.name,
                                            category.name,
                                            sub.name
                                          )
                                        }
                                        className="w-full text-left px-10 py-2 text-sm text-muted-foreground hover:text-foreground hover:bg-muted transition-colors"
                                      >
                                        • {sub.name}
                                      </button>
                                    ))}
                                  </motion.div>
                                )}
                              </AnimatePresence>
                            </div>
                          ))}
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </div>
                ))}
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </>
  );
}
