package com.example.LevelUpGamer.security;

import com.example.LevelUpGamer.model.Usuario;
import com.example.LevelUpGamer.repository.UsuarioRepository;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.core.userdetails.User;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.core.userdetails.UserDetailsService;
import org.springframework.security.core.userdetails.UsernameNotFoundException;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class CustomUserDetailsService implements UserDetailsService {

    private final UsuarioRepository usuarioRepository;

    public CustomUserDetailsService(UsuarioRepository usuarioRepository) {
        this.usuarioRepository = usuarioRepository;
    }

    @Override
    public UserDetails loadUserByUsername(String usernameOrCorreo) throws UsernameNotFoundException {
        Usuario usuario = usuarioRepository.findByUsernameOrCorreo(usernameOrCorreo, usernameOrCorreo)
                .orElseThrow(() -> new UsernameNotFoundException("Usuario no encontrado: " + usernameOrCorreo));

        String rol = usuario.getRol() != null ? usuario.getRol() : "ROLE_CLIENTE";
        if (!rol.startsWith("ROLE_")) {
            rol = "ROLE_" + rol;
        }

        return new User(
                usuario.getUsername(),
                usuario.getPassword(),
                List.of(new SimpleGrantedAuthority(rol))
        );
    }
}
