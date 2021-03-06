import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, Routes } from '@angular/router';
import { FormEditorComponent } from './form-editor/form-editor/form-editor.component';
import { ViewFormsComponent } from './view-forms/view-forms.component';
import { LoginComponent } from './login/login.component';
import { SaveFormsGuardService } from './Services/save-forms-guard.service';
import {AuthGuardService} from './Services/auth-guard.service';

const appRoutes : Routes = [
  {path:'', redirectTo:'forms', pathMatch:'full'},
  {path:'login', component:LoginComponent},
  {path:'forms', component:ViewFormsComponent, canActivate:[AuthGuardService]},
  {path:'edit/:uuid', component:FormEditorComponent, canDeactivate:[SaveFormsGuardService]}
  
]

@NgModule({
  imports: [
    CommonModule,
    RouterModule.forRoot(appRoutes, { useHash: true })
  ],
  declarations: [],
  exports: [RouterModule],
  providers: [SaveFormsGuardService]
})
export class AppRoutingModule { }
