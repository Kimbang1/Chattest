package backend.security;

import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import lombok.RequiredArgsConstructor;
import org.springframework.lang.NonNull;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.core.userdetails.UserDetailsService;
import org.springframework.security.web.authentication.WebAuthenticationDetailsSource;
import org.springframework.stereotype.Component;
import org.springframework.web.filter.OncePerRequestFilter;

import io.jsonwebtoken.Claims;


import java.io.IOException;
import java.util.List;

@Component
@RequiredArgsConstructor
public class JwtAuthenticationFilter extends OncePerRequestFilter {

    private final JwtTokenProvider jwtTokenProvider;
    private final UserDetailsService userDetailsService;

    @Override
    protected void doFilterInternal(
            @NonNull HttpServletRequest request,
            @NonNull HttpServletResponse response,
            @NonNull FilterChain filterChain
    ) throws ServletException, IOException {
        final String authHeader = request.getHeader("Authorization");
        final String jwt;
        final String username;

        if (authHeader == null || !authHeader.startsWith("Bearer ")) {
            filterChain.doFilter(request, response);
            return;
        }

        jwt = authHeader.substring(7);
        username = jwtTokenProvider.extractUsername(jwt);
        System.out.println("JWT Filter: Extracted Username - " + username); 

 if (username != null && SecurityContextHolder.getContext().getAuthentication() == null) {
    Claims claims = jwtTokenProvider.extractAllClaims(jwt); // public으로
    List<String> roles = claims.get("roles", List.class);
    var authorities = roles.stream()
                       .map(r -> r.startsWith("ROLE_") ? r : "ROLE_" + r)
                       .map(SimpleGrantedAuthority::new)
                       .toList();

    UsernamePasswordAuthenticationToken authToken =
            new UsernamePasswordAuthenticationToken(username, null, authorities);
    authToken.setDetails(new WebAuthenticationDetailsSource().buildDetails(request));
    SecurityContextHolder.getContext().setAuthentication(authToken);

    System.out.println("JWT Filter: Authentication set in SecurityContext with roles: " + authorities);
}


        filterChain.doFilter(request, response);
    }
}
