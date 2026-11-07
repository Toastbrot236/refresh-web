import {Component, EventEmitter, Input, Output, ChangeDetectionStrategy} from '@angular/core';
import {FormsModule, ReactiveFormsModule} from "@angular/forms";
import {ButtonGroupComponent} from "./button-group.component";
import {DividerComponent} from "../divider.component";


@Component({
    selector: 'app-form',
    imports: [
        FormsModule,
        ButtonGroupComponent,
        DividerComponent,
        ReactiveFormsModule
    ],
    changeDetection: ChangeDetectionStrategy.Eager,
    template: `
    <form (submit)="submitEvent.emit($event);">
      <ng-content></ng-content>
    
      @if (!compact) {
        <app-divider></app-divider>
      }
    
      <app-button-group>
        <ng-content select="[buttons]"></ng-content>
      </app-button-group>
    </form>
    `
})
export class FormComponent {
  @Output() submitEvent: EventEmitter<Event> = new EventEmitter();
  @Input() compact: boolean = false;
}
