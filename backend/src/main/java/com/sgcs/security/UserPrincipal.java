package com.sgcs.security;

import com.sgcs.entity.User;
import org.springframework.security.core.GrantedAuthority;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.core.userdetails.UserDetails;

import java.util.Collection;
import java.util.List;

public class UserPrincipal implements UserDetails {
    private String id;
    private String fullName;
    private String email;
    private String role;
    private String ward;
    private Collection<? extends GrantedAuthority> authorities;

    public UserPrincipal(String id, String fullName, String email, String role, String ward, Collection<? extends GrantedAuthority> authorities) {
        this.id = id;
        this.fullName = fullName;
        this.email = email;
        this.role = role;
        this.ward = ward;
        this.authorities = authorities;
    }

    public static UserPrincipal create(User user) {
        String roleName = user.getRole() != null ? user.getRole().toUpperCase() : "CITIZEN";
        if (roleName.startsWith("ROLE_")) {
            roleName = roleName.substring(5);
        }
        List<GrantedAuthority> authorities = List.of(
            new SimpleGrantedAuthority("ROLE_" + roleName)
        );
        return new UserPrincipal(
            user.getId(),
            user.getFullName(),
            user.getEmail(),
            roleName,
            user.getWard(),
            authorities
        );
    }

    public String getId() { return id; }
    public String getFullName() { return fullName; }
    public String getEmail() { return email; }
    public String getRole() { return role; }
    public String getWard() { return ward; }

    @Override
    public Collection<? extends GrantedAuthority> getAuthorities() { return authorities; }

    @Override
    public String getPassword() { return ""; }

    @Override
    public String getUsername() { return email; }

    @Override
    public boolean isAccountNonExpired() { return true; }

    @Override
    public boolean isAccountNonLocked() { return true; }

    @Override
    public boolean isCredentialsNonExpired() { return true; }

    @Override
    public boolean isEnabled() { return true; }
}
