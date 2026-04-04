export const PROCEDURE_CATEGORIES = [
  'facial_botox', 'facial_filler', 'facial_stimulator', 'facial_skinbooster',
  'facial_ultraformer', 'facial_laser', 'facial_peel', 'facial_led',
  'facial_microneedling', 'body_lipolysis', 'body_ultraformer',
  'body_radiofrequency', 'body_cavitation', 'body_lymphatic_drainage',
  'body_cryolipolysis', 'other',
] as const;

export type ProcedureCategory = typeof PROCEDURE_CATEGORIES[number];

export const TREATMENT_AREAS = [
  'forehead', 'glabella', 'crow_feet', 'bunny_lines',
  'nasolabial_folds', 'marionette_lines', 'lip_upper', 'lip_lower',
  'lip_commissure', 'chin', 'jaw', 'neck', 'under_eye', 'cheekbones',
  'nose', 'temple', 'full_face',
  'abdomen', 'flanks', 'arms', 'inner_thighs', 'outer_thighs',
  'buttocks', 'back', 'chest', 'full_body',
] as const;

export type TreatmentAreaType = typeof TREATMENT_AREAS[number];

import { ValidationError } from '../errors/ValidationError';

export class ProcedureType {
  private constructor(
    private readonly _category: ProcedureCategory,
    private readonly _name: string,
  ) {}

  static create(category: ProcedureCategory, name: string): ProcedureType {
    if (!PROCEDURE_CATEGORIES.includes(category)) {
      throw new ValidationError(`Invalid procedure category: ${category}`, 'category');
    }
    if (!name || name.trim() === '') {
      throw new ValidationError('Procedure name cannot be empty', 'procedureName');
    }
    return new ProcedureType(category, name.trim());
  }

  get category(): ProcedureCategory {
    return this._category;
  }

  get name(): string {
    return this._name;
  }

  isFacial(): boolean {
    return this._category.startsWith('facial_');
  }

  isCorporal(): boolean {
    return this._category.startsWith('body_');
  }
}
