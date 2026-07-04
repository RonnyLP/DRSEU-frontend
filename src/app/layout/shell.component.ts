import { Component, inject, viewChild } from '@angular/core';
import { Router, RouterLink, RouterLinkActive, RouterOutlet } from '@angular/router';
import { MatToolbarModule } from '@angular/material/toolbar';
import { MatSidenavModule, MatSidenav } from '@angular/material/sidenav';
import { MatListModule } from '@angular/material/list';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatMenuModule } from '@angular/material/menu';
import { MatDividerModule } from '@angular/material/divider';
import { AuthService } from '../core/services/auth.service';

interface NavItem {
  label: string;
  icon: string;
  route: string;
}

@Component({
  selector: 'app-shell',
  imports: [
    RouterOutlet, RouterLink, RouterLinkActive,
    MatToolbarModule, MatSidenavModule, MatListModule,
    MatIconModule, MatButtonModule, MatTooltipModule,
    MatMenuModule, MatDividerModule,
  ],
  templateUrl: './shell.component.html',
})
export class ShellComponent {
  private readonly authService = inject(AuthService);
  private readonly router = inject(Router);

  readonly sidenav = viewChild<MatSidenav>('sidenav');

  readonly navItems: NavItem[] = [
    { label: 'Proyectos', icon: 'folder_open', route: '/projects' },
    { label: 'Solicitudes de Emisión', icon: 'send', route: '/issuance-requests' },
    { label: 'Certificados', icon: 'workspace_premium', route: '/certificates' },
    { label: 'Tipos de Certificado', icon: 'category', route: '/certificate-types' },
  ];

  toggleSidenav(): void {
    this.sidenav()?.toggle();
  }

  cerrarSesion(): void {
    this.authService.logout();
    this.router.navigateByUrl('/auth/login');
  }
}
