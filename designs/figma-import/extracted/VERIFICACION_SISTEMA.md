# Sistema de Verificación de Edad e Identidad - ODDY Market

## Descripción General

ODDY Market implementa un sistema de doble verificación para proteger contenido sensible y operaciones críticas:

1. **Verificación de Edad**: Barrera básica para acceder a departamentos de contenido adulto
2. **Verificación de Identidad (KYC)**: Validación completa con MetaMap para comprar o publicar

## Componentes Disponibles

### 1. AgeVerification
Modal de verificación de edad que solicita fecha de nacimiento.

```tsx
import { AgeVerification } from "./components/AgeVerification";

<AgeVerification
  onVerified={() => console.log("Usuario mayor de 18")}
  onCancel={() => console.log("Usuario canceló")}
  departmentName="Contenido Adulto"
/>
```

### 2. IdentityVerification
Modal de verificación completa con MetaMap (documento + selfie).

```tsx
import { IdentityVerification } from "./components/IdentityVerification";

<IdentityVerification
  userId={user.id}
  reason="purchase_adult" // "publish_secondhand" | "general"
  onVerified={(data) => console.log("Identidad verificada", data)}
  onCancel={() => console.log("Usuario canceló")}
/>
```

### 3. DepartmentGuard
Wrapper que protege automáticamente departamentos de contenido adulto.

```tsx
import { DepartmentGuard } from "./components/DepartmentGuard";

<DepartmentGuard
  departmentId="adult-content"
  departmentName="Contenido Adulto"
  isAdultContent={true}
>
  {/* Tu catálogo de productos aquí */}
  <ProductCatalog />
</DepartmentGuard>
```

## Configuración en Backend

### Variables de Entorno (MetaMap)

Configura en el Gestor de API Keys o en Supabase:

```
METAMAP_CLIENT_ID=your-client-id
METAMAP_CLIENT_SECRET=your-client-secret
METAMAP_FLOW_ID=default (opcional)
```

### Endpoints Disponibles

#### 1. Verificar Estado de Usuario
```
GET /verification/status?userId={userId}
```

Respuesta:
```json
{
  "verified": true,
  "status": "verified",
  "verifiedAt": "2024-01-15T10:30:00Z",
  "verificationType": "metamap",
  "ageVerified": true
}
```

#### 2. Configuración de MetaMap
```
GET /verification/metamap-config?userId={userId}
```

Respuesta:
```json
{
  "clientId": "your-client-id",
  "flowId": "default"
}
```

#### 3. Completar Verificación
```
POST /verification/complete
Body: {
  "userId": "user-123",
  "metamapData": {...},
  "reason": "publish_secondhand"
}
```

#### 4. Verificar Permiso para Acción
```
GET /verification/can-perform?userId={userId}&action=purchase_adult
```

Respuesta:
```json
{
  "allowed": true,
  "verified": true,
  "verifiedAt": "2024-01-15T10:30:00Z"
}
```

#### 5. Marcar Departamento como Adulto
```
POST /verification/department-adult-flag
Body: {
  "departmentId": "dept-123",
  "isAdult": true
}
```

## Uso en Departamentos

### En DepartmentManagement

Al crear/editar un departamento, marca el checkbox:
- ✅ **Contenido para Adultos (+18)**

Esto activará automáticamente:
1. Verificación de edad al acceder
2. Verificación de identidad para comprar

### Ejemplo de Implementación

```tsx
import { useState, useEffect } from "react";
import { DepartmentGuard } from "./components/DepartmentGuard";

function ProductPage({ departmentId }) {
  const [department, setDepartment] = useState(null);

  useEffect(() => {
    // Cargar datos del departamento
    fetch(`/api/departments/${departmentId}`)
      .then(res => res.json())
      .then(data => setDepartment(data));
  }, [departmentId]);

  if (!department) return <div>Cargando...</div>;

  return (
    <DepartmentGuard
      departmentId={department.id}
      departmentName={department.name}
      isAdultContent={department.isAdultContent}
    >
      <div>
        <h1>{department.name}</h1>
        {/* Productos del departamento */}
      </div>
    </DepartmentGuard>
  );
}
```

## Uso en Checkout

### Verificar antes de procesar compra

```tsx
import { useState } from "react";
import { IdentityVerification } from "./components/IdentityVerification";

function Checkout({ cart, user }) {
  const [showVerification, setShowVerification] = useState(false);
  const [verified, setVerified] = useState(false);

  // Verificar si el carrito contiene productos de departamentos adultos
  const hasAdultContent = cart.some(item => item.department?.isAdultContent);

  async function handleCheckout() {
    if (hasAdultContent && !verified) {
      // Verificar identidad primero
      const response = await fetch(
        `/verification/status?userId=${user.id}`
      );
      const data = await response.json();
      
      if (!data.verified) {
        setShowVerification(true);
        return;
      }
    }

    // Proceder con el pago
    processPayment();
  }

  return (
    <div>
      {/* Tu checkout UI */}
      <button onClick={handleCheckout}>
        Finalizar Compra
      </button>

      {showVerification && (
        <IdentityVerification
          userId={user.id}
          reason="purchase_adult"
          onVerified={() => {
            setVerified(true);
            setShowVerification(false);
            handleCheckout();
          }}
          onCancel={() => setShowVerification(false)}
        />
      )}
    </div>
  );
}
```

## Uso en Second Hand

### Ya implementado automáticamente

El componente `SecondHandSeller` ya incluye la verificación:

1. Usuario intenta crear publicación
2. Sistema verifica si tiene identidad validada
3. Si no → Muestra modal de verificación
4. Si sí → Muestra formulario de publicación

## Webhook de MetaMap (Opcional)

Para recibir actualizaciones en tiempo real:

```
POST /verification/metamap-webhook
Headers: x-signature (firma de MetaMap)
```

Configura esta URL en tu panel de MetaMap:
```
https://{projectId}.supabase.co/functions/v1/make-server-0dd48dc4/verification/metamap-webhook
```

## Flujo Completo

### Departamento de Contenido Adulto

1. Usuario hace click en departamento "Adultos"
2. `DepartmentGuard` verifica edad en sessionStorage
3. Si no está verificado → Muestra `AgeVerification`
4. Usuario ingresa fecha de nacimiento
5. Si +18 → Accede al catálogo
6. Usuario agrega productos al carrito
7. En checkout, sistema verifica identidad
8. Si no está verificado → Muestra `IdentityVerification`
9. Usuario completa verificación con MetaMap
10. Usuario puede finalizar compra

### Publicación en Second Hand

1. Usuario va a "Vender en Second Hand"
2. Click en "Nueva Publicación"
3. Sistema verifica identidad
4. Si no está verificado → Muestra `IdentityVerification`
5. Usuario completa verificación con MetaMap
6. Usuario puede publicar artículos

## Almacenamiento de Datos

### KV Store Keys

- `verification:{userId}` - Estado de verificación del usuario
- `user_profile:{userId}` - Perfil con flags de verificación
- `department:{departmentId}` - Configuración del departamento

### Estructura de Verificación

```json
{
  "key": "verification:user-123",
  "userId": "user-123",
  "status": "verified",
  "verificationType": "metamap",
  "verificationId": "metamap-verification-id",
  "verifiedAt": "2024-01-15T10:30:00Z",
  "ageVerified": true,
  "metamapData": {
    "identityId": "...",
    "status": "verified"
  }
}
```

## Notas de Seguridad

1. La verificación de edad se guarda solo en sessionStorage (temporal)
2. La verificación de identidad se guarda en backend (permanente)
3. Las keys de MetaMap nunca se exponen al frontend
4. Los webhooks de MetaMap deben validar firma (implementar en producción)
5. La verificación es irreversible (no se puede "desverificar")

## Testing

### En Desarrollo

MetaMap ofrece un modo sandbox para testing:
- Usa documentos de prueba
- No requiere documentos reales
- Simula todo el flujo de verificación

### Documentos de Prueba

Consulta la documentación de MetaMap para documentos de prueba válidos.
