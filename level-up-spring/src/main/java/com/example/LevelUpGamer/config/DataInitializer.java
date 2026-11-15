package com.example.LevelUpGamer.config;

import com.example.LevelUpGamer.model.Producto;
import com.example.LevelUpGamer.model.Usuario;
import com.example.LevelUpGamer.repository.ProductoRepository;
import com.example.LevelUpGamer.repository.UsuarioRepository;
import org.springframework.boot.CommandLineRunner;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Component;

import java.util.List;

@Component
public class DataInitializer implements CommandLineRunner {

    private final UsuarioRepository usuarioRepository;
    private final ProductoRepository productoRepository;
    private final PasswordEncoder passwordEncoder;

    public DataInitializer(UsuarioRepository usuarioRepository, ProductoRepository productoRepository, PasswordEncoder passwordEncoder) {
        this.usuarioRepository = usuarioRepository;
        this.productoRepository = productoRepository;
        this.passwordEncoder = passwordEncoder;
    }

    @Override
    public void run(String... args) throws Exception {
        if (usuarioRepository.count() == 0) {
            Usuario admin = Usuario.builder()
                    .username("admin")
                    .correo("admin@levelup.cl")
                    .password(passwordEncoder.encode("admin123"))
                    .nombre("Administrador")
                    .apellido("LevelUp")
                    .rol("ROLE_ADMIN")
                    .puntosLevelUp(5000)
                    .build();

            Usuario gamer = Usuario.builder()
                    .username("gamer")
                    .correo("gamer@levelup.cl")
                    .password(passwordEncoder.encode("gamer123"))
                    .nombre("Jugador")
                    .apellido("Pro")
                    .rol("ROLE_CLIENTE")
                    .puntosLevelUp(450)
                    .build();

            usuarioRepository.saveAll(List.of(admin, gamer));
        }

        if (productoRepository.count() == 0) {
            List<Producto> productosIniciales = List.of(
                    Producto.builder()
                            .id("CO001")
                            .nombre("PlayStation 5 Standard Edition")
                            .categoria("Consolas")
                            .categoriaSlug("consolas")
                            .precio(549990)
                            .imagen("https://images.unsplash.com/photo-1606813907291-d86efa9b94db?auto=format&fit=crop&w=800&q=80")
                            .destacado(true)
                            .enOferta(false)
                            .descuento(0)
                            .descripcionCorta("Consola de nueva generación con lector de discos y SSD ultrarrápido.")
                            .descripcionLarga("Disfruta de tiempos de carga casi instantáneos con un SSD de ultra alta velocidad y trazado de rayos.")
                            .stock(8)
                            .rating(4.9)
                            .numReviews(42)
                            .build(),
                    Producto.builder()
                            .id("CO002")
                            .nombre("Xbox Series X 1TB")
                            .categoria("Consolas")
                            .categoriaSlug("consolas")
                            .precio(529990)
                            .imagen("https://images.unsplash.com/photo-1621259182978-fbf93132d53d?auto=format&fit=crop&w=800&q=80")
                            .destacado(true)
                            .enOferta(true)
                            .descuento(10)
                            .descripcionCorta("La consola Xbox más potente con 12 teraflops y Quick Resume.")
                            .descripcionLarga("Juega a 4K hasta a 120 FPS con la arquitectura Xbox Velocity.")
                            .stock(6)
                            .rating(4.8)
                            .numReviews(35)
                            .build(),
                    Producto.builder()
                            .id("JM001")
                            .nombre("Catan")
                            .categoria("Juegos de Mesa")
                            .categoriaSlug("juegos-de-mesa")
                            .precio(29990)
                            .imagen("https://images.unsplash.com/photo-1610890716171-6b1bb98ffd09?auto=format&fit=crop&w=800&q=80")
                            .destacado(true)
                            .enOferta(false)
                            .descuento(0)
                            .descripcionCorta("Un clásico juego de estrategia donde compites por colonizar Catan.")
                            .descripcionLarga("Ideal para 3-4 jugadores y perfecto para noches de juego en familia o amigos.")
                            .stock(15)
                            .rating(4.9)
                            .numReviews(28)
                            .build(),
                    Producto.builder()
                            .id("PE001")
                            .nombre("Teclado Mecánico RGB Pro Gamer")
                            .categoria("Periféricos")
                            .categoriaSlug("perifericos")
                            .precio(69990)
                            .imagen("https://images.unsplash.com/photo-1546435770-a3e426bf472b?auto=format&fit=crop&w=800&q=80")
                            .destacado(true)
                            .enOferta(true)
                            .descuento(15)
                            .descripcionCorta("Switches mecánicos táctiles, iluminación RGB y anti-ghosting total.")
                            .descripcionLarga("Estructura de aluminio aeronáutico y teclas de doble inyección para máxima durabilidad.")
                            .stock(20)
                            .rating(4.7)
                            .numReviews(50)
                            .build(),
                    Producto.builder()
                            .id("AC001")
                            .nombre("Mousepad Gamer Extendido XXL")
                            .categoria("Accesorios")
                            .categoriaSlug("accesorios")
                            .precio(19990)
                            .imagen("https://images.unsplash.com/photo-1600080972464-8e5f35f63d08?auto=format&fit=crop&w=800&q=80")
                            .destacado(false)
                            .enOferta(false)
                            .descuento(0)
                            .descripcionCorta("Superficie de microfibra de baja fricción y base de goma antideslizante.")
                            .descripcionLarga("Dimensiones 900x400x4mm con bordes cosidos anti-deshilachado.")
                            .stock(25)
                            .rating(4.6)
                            .numReviews(19)
                            .build()
            );

            productoRepository.saveAll(productosIniciales);
        }
    }
}
