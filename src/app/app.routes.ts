import { Routes } from '@angular/router';
import { authGuard } from './core/guards/auth.guard';
import { LoginComponent } from './modules/auth/login.component';
import { MainLayoutComponent } from './layout/main-layout.component';
import { DashboardComponent } from './modules/dashboard/dashboard.component';
import { UnidadesComponent } from './modules/unidades/unidades.component';
import { FinanzasComponent } from './modules/finanzas/finanzas.component';
import { PagosComponent } from './modules/pagos/pagos.component';
import { ConserjeriaComponent } from './modules/conserjeria/conserjeria.component';
import { ReservasComponent } from './modules/reservas/reservas.component';
import { IncidenciasComponent } from './modules/incidencias/incidencias.component';
import { ComunicadosComponent } from './modules/comunicados/comunicados.component';
import { AsambleasComponent } from './modules/asambleas/asambleas.component';
import { CondominiosComponent } from './modules/condominios/condominios.component';
import { MembresiasComponent } from './modules/membresias/membresias.component';
import { PersonasComponent } from './modules/personas/personas.component';

export const routes: Routes = [
  { path: 'login', component: LoginComponent },
  {
    path: '',
    component: MainLayoutComponent,
    canActivate: [authGuard],
    children: [
      { path: '', redirectTo: 'dashboard', pathMatch: 'full' },
      { path: 'dashboard', component: DashboardComponent },
      { path: 'condominios', component: CondominiosComponent },
      { path: 'personas', component: PersonasComponent },
      { path: 'membresias', component: MembresiasComponent },
      { path: 'unidades', component: UnidadesComponent },
      { path: 'finanzas', component: FinanzasComponent },
      { path: 'pagos', component: PagosComponent },
      { path: 'conserjeria', component: ConserjeriaComponent },
      { path: 'reservas', component: ReservasComponent },
      { path: 'comunicados', component: ComunicadosComponent },
      { path: 'incidencias', component: IncidenciasComponent },
      { path: 'asambleas', component: AsambleasComponent },
    ]
  },
  { path: '**', redirectTo: 'dashboard' }
];
