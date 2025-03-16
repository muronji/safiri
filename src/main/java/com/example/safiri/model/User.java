package com.example.safiri.model;

import com.fasterxml.jackson.annotation.JsonIgnore;
import jakarta.persistence.*;
import lombok.*;
import org.springframework.security.core.GrantedAuthority;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.core.userdetails.UserDetails;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.Collection;
import java.util.Collections;

@Entity
@Data
@EqualsAndHashCode
@AllArgsConstructor
@NoArgsConstructor
public class User implements UserDetails {

        @Id
        @GeneratedValue(strategy = GenerationType.IDENTITY)
        private Long Id;

        @Column(nullable = false)
        private String name;

        @Column(nullable = false, unique = true)
        private String email;

        @Column(nullable = false)
        @JsonIgnore
        private String password;

        @Column(nullable = true) // Now optional for admins
        private String identifier;

        @Column(nullable = true) // Now optional for admins
        private String identifierType;

        @Column(nullable = false)
        private BigDecimal walletBalance = BigDecimal.ZERO;

        @Column(nullable = false, updatable = false)
        private LocalDateTime creationDate;

        @Column(nullable = false)
        private LocalDateTime lastUpdated;

        @Enumerated(EnumType.STRING)
        @Column(nullable = false)
        private Role role; // Explicitly set role

        @OneToOne(fetch = FetchType.EAGER, mappedBy = "user", cascade = CascadeType.ALL)
        @JsonIgnore
        @ToString.Exclude
        private Wallet wallet;

        private Boolean locked = false;
        private Boolean enabled = false;

        @PrePersist
        protected void onCreate() {
                this.creationDate = LocalDateTime.now();
                this.lastUpdated = LocalDateTime.now();
        }

        @PreUpdate
        protected void onUpdate() {
                this.lastUpdated = LocalDateTime.now();
        }

        // Spring Security UserDetails Methods
        @Override
        public Collection<? extends GrantedAuthority> getAuthorities() {
                return Collections.singletonList(new SimpleGrantedAuthority(role.name()));
        }

        @Override
        public String getUsername() {
                return email;
        }

        @Override
        public boolean isAccountNonExpired() {
                return true;
        }

        @Override
        public boolean isAccountNonLocked() {
                return true;
        }

        @Override
        public boolean isCredentialsNonExpired() {
                return true;
        }

        @Override
        public boolean isEnabled() {
                return true;
        }
}
