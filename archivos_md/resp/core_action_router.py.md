### .\core\action_router.py

```py
# core/action_router.py
from interfaces.gmail_api import obtener_correos_recientes

def ejecutar_accion(intencion, comando=None, contexto=None, filtros=None):

    print("🎯 Ejecutando acción:", intencion)
    print("🔍 Tipo de intención:", type(intencion))

    if not isinstance(intencion, dict):
        return "Lo siento, no entendí lo que quieres hacer."

    accion = intencion.get("accion")
    print("🔄 Acción original:", accion)
    filtros = intencion.get("filtros") or {}

    # Redirige modificando la intención y la acción explícitamente
    if accion in ["mostrar_ultimo_correo", "obtener_ultimo_correo", "mostrar_correo"]:
        filtros["cantidad"] = 1
        intencion = {"accion": "listar_correos", "filtros": filtros}
        accion = "listar_correos"
        print("🔁 Redirigido a acción:", accion)

    if accion in ["listar_correos"]:
        print("✔️ Ejecutando listar_correos con filtros:", filtros)
        lista = obtener_correos_recientes(50)

        remitente_filtro = filtros.get("remite", "").lower().strip()
        if remitente_filtro:
            lista = [m for m in lista if remitente_filtro in m.lower()]

        if filtros.get("orden") == "ascendente":
            lista = list(reversed(lista))

        cantidad = filtros.get("cantidad", len(lista))
        lista = lista[:cantidad]

        if not lista:
            return "No encontré correos que coincidan con tu solicitud."

        if cantidad == 1 or len(lista) == 1:
            return f"El correo más reciente es: {lista[0]}"
        else:
            return f"Aquí tienes los {len(lista)} correos más recientes:\n" + "\n".join(lista)

    elif accion in ["buscar_correo", "buscar_correos"]:
        remitente_filtro = filtros.get("remite", "").lower().strip()
        lista = obtener_correos_recientes(10)
        encontrados = [m for m in lista if remitente_filtro in m.lower()]

        if not encontrados:
            return f"No encontré correos de {remitente_filtro}."
        return f"El correo más reciente de {remitente_filtro} es: {encontrados[0]}"

    return "Lo siento, no entendí lo que quieres hacer."


```