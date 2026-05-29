import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-spinner',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div *ngIf="loading" class="d-flex justify-content-center align-items-center py-5">
      <div class="spinner-border" role="status"
           style="color:#C9A84C;width:2rem;height:2rem;">
        <span class="visually-hidden">Chargement...</span>
      </div>
      <span class="ms-3" style="color:rgba(255,255,255,0.5);font-size:12px;">
        Chargement...
      </span>
    </div>
  `
})
export class SpinnerComponent {
  @Input() loading = false;
}