// Base de datos de productos Level-Up Gamer
const PRODUCTOS_DATA = [
    {
        id: 'JM001',
        nombre: 'Catan',
        categoria: 'Juegos de Mesa',
        categoriaSlug: 'juegos-de-mesa',
        precio: 29990,
        imagen: 'https://images.unsplash.com/photo-1610890716171-6b1bb98ffd09?auto=format&fit=crop&w=600&q=80',
        destacado: true,
        enOferta: false,
        descuento: 0,
        descripcionCorta: 'Un clásico juego de estrategia donde los jugadores compiten por colonizar y expandirse en la isla de Catan.',
        descripcionLarga: 'Un clásico juego de estrategia donde los jugadores compiten por colonizar y expandirse en la isla de Catan. Ideal para 3-4 jugadores y perfecto para noches de juego en familia o con amigos.',
        origen: 'Devir / Klaus Teuber (Alemania)',
        especificaciones: {
            'Jugadores': '3 - 4 personas',
            'Tiempo de juego': '60 - 90 minutos',
            'Edad recomendada': '+10 años',
            'Idioma': 'Español'
        },
        stock: 15,
        rating: 4.9,
        numReviews: 28
    },
    {
        id: 'JM002',
        nombre: 'Carcassonne',
        categoria: 'Juegos de Mesa',
        categoriaSlug: 'juegos-de-mesa',
        precio: 24990,
        imagen: 'https://images.unsplash.com/photo-1606167668584-78701c57f13d?auto=format&fit=crop&w=600&q=80',
        destacado: false,
        enOferta: true,
        descuento: 10,
        descripcionCorta: 'Juego de colocación de fichas donde los jugadores construyen el paisaje alrededor de la fortaleza medieval.',
        descripcionLarga: 'Un juego de colocación de fichas donde los jugadores construyen el paisaje alrededor de la fortaleza medieval de Carcassonne. Ideal para 2-5 jugadores y fácil de aprender.',
        origen: 'Hans im Glück / Devir (Alemania)',
        especificaciones: {
            'Jugadores': '2 - 5 personas',
            'Tiempo de juego': '35 - 45 minutos',
            'Edad recomendada': '+7 años',
            'Idioma': 'Español'
        },
        stock: 20,
        rating: 4.7,
        numReviews: 19
    },
    {
        id: 'AC001',
        nombre: 'Controlador Inalámbrico Xbox Series X',
        categoria: 'Accesorios',
        categoriaSlug: 'accesorios',
        precio: 59990,
        imagen: 'https://images.unsplash.com/photo-1600080972464-8e5f35f63d08?auto=format&fit=crop&w=600&q=80',
        destacado: true,
        enOferta: false,
        descuento: 0,
        descripcionCorta: 'Ofrece una experiencia de juego cómoda con botones mapeables y respuesta táctil mejorada.',
        descripcionLarga: 'Ofrece una experiencia de juego cómoda con botones mapeables y una respuesta táctil mejorada. Compatible con consolas Xbox Series X|S, Xbox One, PC Windows, Android e iOS.',
        origen: 'Microsoft Corporation (EE.UU.)',
        especificaciones: {
            'Conectividad': 'Xbox Wireless, Bluetooth, USB-C',
            'Compatibilidad': 'Xbox Series X|S, Xbox One, Windows 10/11, Android, iOS',
            'Batería': 'Hasta 40 horas con pilas AA',
            'Conector Jack': '3.5 mm para auriculares estéreo'
        },
        stock: 12,
        rating: 4.8,
        numReviews: 45
    },
    {
        id: 'AC002',
        nombre: 'Auriculares Gamer HyperX Cloud II',
        categoria: 'Accesorios',
        categoriaSlug: 'accesorios',
        precio: 79990,
        imagen: 'https://images.unsplash.com/photo-1546435770-a3e426bf472b?auto=format&fit=crop&w=600&q=80',
        destacado: true,
        enOferta: true,
        descuento: 15,
        descripcionCorta: 'Proporcionan un sonido envolvente de calidad con micrófono desmontable y almohadillas viscoelásticas.',
        descripcionLarga: 'Proporcionan un sonido envolvente de calidad 7.1 virtual con un micrófono desmontable con cancelación de ruido y almohadillas de espuma viscoelástica para mayor comodidad durante largas sesiones de juego.',
        origen: 'HyperX / HP Inc. (EE.UU.)',
        especificaciones: {
            'Audio': 'Sonido Envolvente Virtual 7.1',
            'Transductores': 'Dinámicos de 53 mm con imanes de neodimio',
            'Micrófono': 'Desmontable con cancelación de ruido',
            'Conexión': 'USB y Jack 3.5 mm'
        },
        stock: 18,
        rating: 4.9,
        numReviews: 62
    },
    {
        id: 'CO001',
        nombre: 'PlayStation 5',
        categoria: 'Consolas',
        categoriaSlug: 'consolas',
        precio: 549990,
        imagen: 'https://images.unsplash.com/photo-1606813907291-d86efa9b94db?auto=format&fit=crop&w=600&q=80',
        destacado: true,
        enOferta: false,
        descuento: 0,
        descripcionCorta: 'Consola de última generación de Sony con tiempos de carga ultrarrápidos y gráficos impresionantes.',
        descripcionLarga: 'La consola de última generación de Sony, que ofrece gráficos impresionantes en 4K hasta 120 fps y tiempos de carga ultrarrápidos gracias a su SSD de alta velocidad para una experiencia de juego inmersiva.',
        origen: 'Sony Interactive Entertainment (Japón)',
        especificaciones: {
            'CPU': 'x86-64-AMD Ryzen Zen 2 de 8 núcleos / 16 hilos',
            'GPU': 'AMD Radeon RDNA 2 de hasta 2.23 GHz (10.3 TFLOPS)',
            'Almacenamiento': 'SSD ultrarrápido de 825 GB',
            'Salida de video': 'Soporte 4K 120Hz, 8K, VRR'
        },
        stock: 5,
        rating: 5.0,
        numReviews: 89
    },
    {
        id: 'CG001',
        nombre: 'PC Gamer ASUS ROG Strix',
        categoria: 'Computadores Gamers',
        categoriaSlug: 'computadores-gamers',
        precio: 1299990,
        imagen: 'https://images.unsplash.com/photo-1587202372775-e229f172b9d7?auto=format&fit=crop&w=600&q=80',
        destacado: true,
        enOferta: true,
        descuento: 10,
        descripcionCorta: 'Potente equipo diseñado para los gamers más exigentes con los últimos componentes de vanguardia.',
        descripcionLarga: 'Un potente equipo diseñado para los gamers más exigentes, equipado con los últimos componentes para ofrecer un rendimiento excepcional en cualquier juego competitivo y de última generación.',
        origen: 'ASUS Republic of Gamers (Taiwán)',
        especificaciones: {
            'Procesador': 'Intel Core i7-13700KF de 16 núcleos',
            'Tarjeta Gráfica': 'NVIDIA GeForce RTX 4070 12GB GDDR6X',
            'Memoria RAM': '32GB DDR5 5600MHz RGB',
            'Almacenamiento': '1TB SSD NVMe M.2 PCIe 4.0',
            'Refrigeración': 'Líquida AIO ROG Strix 240mm'
        },
        stock: 3,
        rating: 4.9,
        numReviews: 14
    },
    {
        id: 'SG001',
        nombre: 'Silla Gamer Secretlab Titan',
        categoria: 'Sillas Gamers',
        categoriaSlug: 'sillas-gamers',
        precio: 349990,
        imagen: 'https://images.unsplash.com/photo-1598550476439-6847785fcea6?auto=format&fit=crop&w=600&q=80',
        destacado: false,
        enOferta: false,
        descuento: 0,
        descripcionCorta: 'Diseñada para el máximo confort ergonómico con soporte lumbar ajustable para largas jornadas.',
        descripcionLarga: 'Diseñada para el máximo confort, esta silla ofrece un soporte ergonómico avanzado y personalización ajustable en 4 direcciones para sesiones de juego prolongadas y productividad sin fatiga.',
        origen: 'Secretlab (Singapur)',
        especificaciones: {
            'Material': 'Cuero sintético híbrido PRIME 2.0 / SoftWeave',
            'Soporte lumbar': 'Sistema integrado L-ADAPT de 4 direcciones',
            'Reposabrazos': 'Full-Metal 4D magnéticos CloudSwap',
            'Inclinación': 'Hasta 165 grados con bloqueo multi-ángulo'
        },
        stock: 8,
        rating: 4.8,
        numReviews: 31
    },
    {
        id: 'MS001',
        nombre: 'Mouse Gamer Logitech G502 HERO',
        categoria: 'Mouse',
        categoriaSlug: 'mouse',
        precio: 49990,
        imagen: 'https://images.unsplash.com/photo-1615663245857-ac93bb7c39e7?auto=format&fit=crop&w=600&q=80',
        destacado: true,
        enOferta: false,
        descuento: 0,
        descripcionCorta: 'Sensor de alta precisión HERO 25K con 11 botones programables y pesas ajustables.',
        descripcionLarga: 'Con sensor de alta precisión HERO 25K y botones personalizables, este mouse es ideal para gamers que buscan un control preciso, personalización de peso y memoria integrada.',
        origen: 'Logitech G (Suiza)',
        especificaciones: {
            'Sensor': 'HERO 25K (100 - 25.600 DPI)',
            'Botones': '11 botones programables',
            'Pesas': '5 pesas ajustables de 3.6g incluidas',
            'Iluminación': 'RGB LIGHTSYNC 16.8M colores'
        },
        stock: 25,
        rating: 4.9,
        numReviews: 76
    },
    {
        id: 'MP001',
        nombre: 'Mousepad Razer Goliathus Extended Chroma',
        categoria: 'Mousepad',
        categoriaSlug: 'mousepad',
        precio: 29990,
        imagen: 'https://images.unsplash.com/photo-1527864550417-7fd91fc51a46?auto=format&fit=crop&w=600&q=80',
        destacado: false,
        enOferta: true,
        descuento: 15,
        descripcionCorta: 'Área amplia con iluminación RGB Razer Chroma personalizable y superficie de microtextura.',
        descripcionLarga: 'Ofrece un área de juego amplia con iluminación RGB personalizable Razer Chroma, asegurando una superficie suave y uniforme optimizada para todo tipo de sensores y estilos de juego.',
        origen: 'Razer Inc. (EE.UU.)',
        especificaciones: {
            'Dimensiones': '920 mm x 294 mm x 3 mm',
            'Superficie': 'Tela microtexturizada para velocidad y control',
            'Iluminación': 'Razer Chroma RGB con 16.8 millones de opciones',
            'Base': 'Goma antideslizante de alta adherencia'
        },
        stock: 14,
        rating: 4.7,
        numReviews: 24
    },
    {
        id: 'PP001',
        nombre: 'Polera Gamer Personalizada ','Level-Up':'',
        categoria: 'Poleras Personalizadas',
        categoriaSlug: 'poleras-personalizadas',
        precio: 14990,
        imagen: 'https://images.unsplash.com/photo-1521572267360-ee0c2909d518?auto=format&fit=crop&w=600&q=80',
        destacado: true,
        enOferta: false,
        descuento: 0,
        descripcionCorta: 'Camiseta cómoda y estilizada con posibilidad de personalizar tu gamertag o diseño favorito.',
        descripcionLarga: 'Una camiseta cómoda y estilizada de 100% algodón peinado, con la posibilidad de personalizarla con tu gamer tag o diseño favorito en serigrafía o estampado de alta durabilidad.',
        origen: 'Level-Up Apparel (Chile)',
        especificaciones: {
            'Material': '100% Algodón peinado de 180 grs',
            'Tallas': 'S, M, L, XL, XXL',
            'Personalización': 'GamerTag o estampado en pecho/espalda',
            'Corte': 'Unisex Regular Fit'
        },
        stock: 30,
        rating: 4.6,
        numReviews: 18
    },
    {
        id: 'PP002',
        nombre: 'Polerón Gamer Hoodie ','Level-Up Cyber':'',
        categoria: 'Polerones Gamers Personalizados',
        categoriaSlug: 'polerones-gamers',
        precio: 29990,
        imagen: 'https://images.unsplash.com/photo-1556905055-8f358a7a47b2?auto=format&fit=crop&w=600&q=80',
        destacado: false,
        enOferta: true,
        descuento: 10,
        descripcionCorta: 'Polerón hoodie térmico con bolsillo frontal y bordado de alta calidad de Level-Up.',
        descripcionLarga: 'Polerón gamer tipo hoodie con capucha ajustable y felpa interior térmica. Personalízalo con tu clan tag o insignia preferida. Máxima comodidad para las jornadas frías de gaming.',
        origen: 'Level-Up Apparel (Chile)',
        especificaciones: {
            'Material': '65% Algodón, 35% Poliéster con felpa interior',
            'Tallas': 'S, M, L, XL, XXL',
            'Capucha': 'Doble capa con cordón ajustable',
            'Bolsillo': 'Canguro frontal reforzado'
        },
        stock: 22,
        rating: 4.8,
        numReviews: 12
    }
];

function formatCLP(valor) {
    return new Intl.NumberFormat('es-CL', {
        style: 'currency',
        currency: 'CLP',
        maximumFractionDigits: 0
    }).format(valor);
}

function getProductById(id) {
    return PRODUCTOS_DATA.find(p => p.id === id);
}
