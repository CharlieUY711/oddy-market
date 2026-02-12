-- ============================================
-- MIGRATION: PARTIES
-- Fecha: 2026-02-12
-- Descripción: Tabla única para Personas y Organizaciones con roles contextuales
-- ============================================

-- Tabla: parties
CREATE TABLE IF NOT EXISTS parties (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  entity_id UUID NOT NULL REFERENCES entities(id) ON DELETE CASCADE,
  
  -- Tipo de party
  type VARCHAR(20) NOT NULL CHECK (type IN ('PERSON', 'ORGANIZATION')),
  
  -- Datos según tipo (JSONB para flexibilidad)
  person_data JSONB,
  -- Ejemplo PERSON:
  -- {
  --   "first_name": "Juan",
  --   "last_name": "Pérez",
  --   "middle_name": null,
  --   "date_of_birth": "1985-03-15",
  --   "gender": "MALE",
  --   "nationality": "UY"
  -- }
  
  organization_data JSONB,
  -- Ejemplo ORGANIZATION:
  -- {
  --   "legal_name": "Empresa SA",
  --   "trade_name": "Empresa",
  --   "company_type": "SA",
  --   "incorporation_date": "2020-01-01",
  --   "industry": "RETAIL",
  --   "employee_count": 50
  -- }
  
  -- Contacto (común para ambos)
  contact JSONB NOT NULL,
  -- Ejemplo CONTACT:
  -- {
  --   "email": "contacto@email.com",
  --   "phone": "+598 99 123 456",
  --   "mobile": "+598 99 987 654",
  --   "website": "https://empresa.com",
  --   "address": {
  --     "street": "Av. 18 de Julio 1234",
  --     "city": "Montevideo",
  --     "state": "Montevideo",
  --     "postal_code": "11200",
  --     "country": "UY"
  --   }
  -- }
  
  -- Identificación fiscal
  tax_data JSONB,
  -- Ejemplo TAX:
  -- {
  --   "tax_id": "12345678",
  --   "tax_id_type": "DNI",
  --   "tax_status": "ACTIVE",
  --   "country": "UY"
  -- }
  
  -- Roles contextuales (array)
  roles VARCHAR(50)[] DEFAULT ARRAY[]::VARCHAR[],
  -- Ejemplos: ['CUSTOMER'], ['SUPPLIER'], ['CUSTOMER', 'SUPPLIER', 'EMPLOYEE']
  
  -- Datos contextuales específicos por rol
  context_data JSONB DEFAULT '{}'::JSONB,
  -- Ejemplo CONTEXT_DATA:
  -- {
  --   "customer": {
  --     "customer_type": "B2C",
  --     "credit_limit": 50000,
  --     "credit_used": 0,
  --     "payment_terms": "NET_30",
  --     "loyalty_points": 1500,
  --     "loyalty_tier": "GOLD",
  --     "preferred_language": "es",
  --     "preferred_currency": "USD",
  --     "accepts_marketing": true,
  --     "marketing_source": "Instagram",
  --     "total_orders": 45,
  --     "total_spent": 125000,
  --     "average_order_value": 2777.78,
  --     "last_order_date": "2026-02-10T10:00:00Z"
  --   },
  --   "supplier": {
  --     "supplier_type": "DISTRIBUTOR",
  --     "payment_terms": "NET_60",
  --     "lead_time_days": 15,
  --     "minimum_order_value": 5000,
  --     "rating": 4.5,
  --     "quality_score": 4.8,
  --     "delivery_score": 4.2,
  --     "communication_score": 4.6,
  --     "total_orders": 12,
  --     "total_purchased": 45000,
  --     "last_order_date": "2026-02-08T14:30:00Z",
  --     "certifications": ["ISO_9001", "ISO_14001"],
  --     "preferred": true
  --   }
  -- }
  
  -- Status
  status VARCHAR(20) DEFAULT 'ACTIVE' CHECK (status IN ('ACTIVE', 'INACTIVE', 'SUSPENDED', 'ARCHIVED')),
  
  -- Metadata adicional
  metadata JSONB DEFAULT '{}'::JSONB,
  
  -- Auditoría
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  created_by UUID REFERENCES users(id),
  updated_by UUID REFERENCES users(id),
  
  -- Constraint: debe tener person_data O organization_data
  CONSTRAINT parties_type_data_check CHECK (
    (type = 'PERSON' AND person_data IS NOT NULL) OR
    (type = 'ORGANIZATION' AND organization_data IS NOT NULL)
  )
);

-- ============================================
-- INDEXES
-- ============================================

-- Índice por entity_id (multi-tenant)
CREATE INDEX IF NOT EXISTS idx_parties_entity 
  ON parties(entity_id);

-- Índice por tipo (PERSON / ORGANIZATION)
CREATE INDEX IF NOT EXISTS idx_parties_type 
  ON parties(type);

-- Índice GIN para roles (búsqueda rápida en array)
CREATE INDEX IF NOT EXISTS idx_parties_roles 
  ON parties USING GIN(roles);

-- Índice GIN para email en contact
CREATE INDEX IF NOT EXISTS idx_parties_contact_email 
  ON parties USING GIN((contact->'email'));

-- Índice GIN para tax_id en tax_data
CREATE INDEX IF NOT EXISTS idx_parties_tax_id 
  ON parties USING GIN((tax_data->'tax_id'));

-- Índice por status
CREATE INDEX IF NOT EXISTS idx_parties_status 
  ON parties(status);

-- Índice para búsqueda full-text (español)
CREATE INDEX IF NOT EXISTS idx_parties_search 
  ON parties USING GIN(
    to_tsvector('spanish', 
      COALESCE(person_data->>'first_name', '') || ' ' ||
      COALESCE(person_data->>'last_name', '') || ' ' ||
      COALESCE(organization_data->>'legal_name', '') || ' ' ||
      COALESCE(organization_data->>'trade_name', '') || ' ' ||
      COALESCE(contact->>'email', '')
    )
  );

-- Índice compuesto para entity + status
CREATE INDEX IF NOT EXISTS idx_parties_entity_status 
  ON parties(entity_id, status);

-- ============================================
-- ROW LEVEL SECURITY (RLS)
-- ============================================

-- Habilitar RLS
ALTER TABLE parties ENABLE ROW LEVEL SECURITY;

-- Policy: Los usuarios solo pueden ver parties de su entity
CREATE POLICY parties_select_policy ON parties
  FOR SELECT
  USING (
    entity_id IN (
      SELECT entity_id FROM users WHERE id = auth.uid()
    )
  );

-- Policy: Los usuarios solo pueden crear parties en su entity
CREATE POLICY parties_insert_policy ON parties
  FOR INSERT
  WITH CHECK (
    entity_id IN (
      SELECT entity_id FROM users WHERE id = auth.uid()
    )
  );

-- Policy: Los usuarios solo pueden actualizar parties de su entity
CREATE POLICY parties_update_policy ON parties
  FOR UPDATE
  USING (
    entity_id IN (
      SELECT entity_id FROM users WHERE id = auth.uid()
    )
  );

-- Policy: Los usuarios solo pueden eliminar parties de su entity
CREATE POLICY parties_delete_policy ON parties
  FOR DELETE
  USING (
    entity_id IN (
      SELECT entity_id FROM users WHERE id = auth.uid()
    )
  );

-- ============================================
-- TRIGGERS
-- ============================================

-- Trigger: Actualizar updated_at automáticamente
CREATE OR REPLACE FUNCTION update_parties_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER parties_updated_at_trigger
  BEFORE UPDATE ON parties
  FOR EACH ROW
  EXECUTE FUNCTION update_parties_updated_at();

-- ============================================
-- FUNCIONES ÚTILES
-- ============================================

-- Función: Obtener nombre para mostrar
CREATE OR REPLACE FUNCTION get_party_display_name(party_record parties)
RETURNS TEXT AS $$
BEGIN
  IF party_record.type = 'PERSON' THEN
    RETURN CONCAT(
      party_record.person_data->>'first_name',
      ' ',
      party_record.person_data->>'last_name'
    );
  ELSE
    RETURN party_record.organization_data->>'legal_name';
  END IF;
END;
$$ LANGUAGE plpgsql IMMUTABLE;

-- Función: Buscar parties por texto (full-text search)
CREATE OR REPLACE FUNCTION search_parties(
  p_entity_id UUID,
  p_search_term TEXT,
  p_limit INT DEFAULT 50
)
RETURNS TABLE (
  id UUID,
  type VARCHAR,
  display_name TEXT,
  email TEXT,
  roles VARCHAR[],
  relevance REAL
) AS $$
BEGIN
  RETURN QUERY
  SELECT 
    p.id,
    p.type,
    get_party_display_name(p) as display_name,
    p.contact->>'email' as email,
    p.roles,
    ts_rank(
      to_tsvector('spanish', 
        COALESCE(p.person_data->>'first_name', '') || ' ' ||
        COALESCE(p.person_data->>'last_name', '') || ' ' ||
        COALESCE(p.organization_data->>'legal_name', '') || ' ' ||
        COALESCE(p.organization_data->>'trade_name', '') || ' ' ||
        COALESCE(p.contact->>'email', '')
      ),
      plainto_tsquery('spanish', p_search_term)
    ) as relevance
  FROM parties p
  WHERE p.entity_id = p_entity_id
    AND p.status = 'ACTIVE'
    AND to_tsvector('spanish', 
      COALESCE(p.person_data->>'first_name', '') || ' ' ||
      COALESCE(p.person_data->>'last_name', '') || ' ' ||
      COALESCE(p.organization_data->>'legal_name', '') || ' ' ||
      COALESCE(p.organization_data->>'trade_name', '') || ' ' ||
      COALESCE(p.contact->>'email', '')
    ) @@ plainto_tsquery('spanish', p_search_term)
  ORDER BY relevance DESC
  LIMIT p_limit;
END;
$$ LANGUAGE plpgsql;

-- ============================================
-- DATOS DE EJEMPLO (OPCIONAL - COMENTADO)
-- ============================================

-- NOTA: Descomentar solo para desarrollo/testing

/*
-- Insertar persona como cliente
INSERT INTO parties (
  entity_id,
  type,
  person_data,
  contact,
  tax_data,
  roles,
  context_data
) VALUES (
  'uuid-entity-default', -- Reemplazar con entity_id real
  'PERSON',
  '{"first_name": "Juan", "last_name": "Pérez", "date_of_birth": "1985-03-15", "gender": "MALE", "nationality": "UY"}',
  '{"email": "juan.perez@gmail.com", "phone": "+598 99 123 456", "address": {"street": "Av. 18 de Julio 1234", "city": "Montevideo", "postal_code": "11200", "country": "UY"}}',
  '{"tax_id": "12345678", "tax_id_type": "DNI", "country": "UY"}',
  ARRAY['CUSTOMER'],
  '{"customer": {"credit_limit": 50000, "payment_terms": "NET_30", "loyalty_points": 0, "total_orders": 0, "total_spent": 0}}'
);

-- Insertar organización como proveedor
INSERT INTO parties (
  entity_id,
  type,
  organization_data,
  contact,
  tax_data,
  roles,
  context_data
) VALUES (
  'uuid-entity-default', -- Reemplazar con entity_id real
  'ORGANIZATION',
  '{"legal_name": "Distribuidora SA", "trade_name": "Distribuidora", "company_type": "SA", "industry": "WHOLESALE", "employee_count": 25}',
  '{"email": "contacto@distribuidora.com", "phone": "+598 2 123 4567", "website": "https://distribuidora.com", "address": {"street": "Rambla 2500", "city": "Montevideo", "country": "UY"}}',
  '{"tax_id": "211234567890", "tax_id_type": "RUT", "country": "UY"}',
  ARRAY['SUPPLIER'],
  '{"supplier": {"supplier_type": "DISTRIBUTOR", "payment_terms": "NET_60", "lead_time_days": 15, "rating": 4.5, "total_orders": 0}}'
);

-- Insertar persona con múltiples roles (cliente y proveedor)
INSERT INTO parties (
  entity_id,
  type,
  person_data,
  contact,
  tax_data,
  roles,
  context_data
) VALUES (
  'uuid-entity-default', -- Reemplazar con entity_id real
  'PERSON',
  '{"first_name": "María", "last_name": "González", "date_of_birth": "1990-06-20", "gender": "FEMALE", "nationality": "UY"}',
  '{"email": "maria.gonzalez@email.com", "phone": "+598 99 987 654", "address": {"street": "Bulevar Artigas 500", "city": "Montevideo", "postal_code": "11300", "country": "UY"}}',
  '{"tax_id": "87654321", "tax_id_type": "DNI", "country": "UY"}',
  ARRAY['CUSTOMER', 'SUPPLIER'],
  '{"customer": {"credit_limit": 100000, "payment_terms": "NET_30", "loyalty_points": 2500, "total_orders": 25, "total_spent": 75000}, "supplier": {"supplier_type": "SERVICE", "payment_terms": "NET_45", "lead_time_days": 7, "rating": 4.8, "total_orders": 8}}'
);
*/

-- ============================================
-- COMENTARIOS Y DOCUMENTACIÓN
-- ============================================

COMMENT ON TABLE parties IS 'Tabla única para Personas y Organizaciones con roles contextuales (CUSTOMER, SUPPLIER, EMPLOYEE, etc.)';
COMMENT ON COLUMN parties.type IS 'Tipo de party: PERSON (persona física) u ORGANIZATION (entidad jurídica)';
COMMENT ON COLUMN parties.person_data IS 'Datos específicos de personas físicas (JSONB): first_name, last_name, date_of_birth, etc.';
COMMENT ON COLUMN parties.organization_data IS 'Datos específicos de organizaciones (JSONB): legal_name, trade_name, company_type, etc.';
COMMENT ON COLUMN parties.contact IS 'Información de contacto (JSONB): email, phone, address, website';
COMMENT ON COLUMN parties.tax_data IS 'Datos fiscales (JSONB): tax_id (DNI/RUT/CUIT), tax_id_type, country';
COMMENT ON COLUMN parties.roles IS 'Array de roles contextuales: CUSTOMER, SUPPLIER, EMPLOYEE, CONTACT, PARTNER, etc.';
COMMENT ON COLUMN parties.context_data IS 'Datos específicos por rol (JSONB): customer (credit_limit, loyalty_points), supplier (rating, lead_time), etc.';
COMMENT ON COLUMN parties.status IS 'Estado de la party: ACTIVE, INACTIVE, SUSPENDED, ARCHIVED';

-- ============================================
-- FIN DE MIGRACIÓN
-- ============================================
