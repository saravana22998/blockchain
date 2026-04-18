import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';

import { PortalComponent } from './portal.component';
import { RendererComponent } from './renderer.component';

const routes: Routes = [
  { path: '', component: PortalComponent },
  { path: 'renderer', component: RendererComponent }
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }
