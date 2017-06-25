import { normalize } from 'normalizr';
import { getDenormCourseById } from '../reducers/entities_reducer';
import * as schemas from '../schema';

const course = {
  result: ['C1'],
  entities: {
    courses: { C1: { id: 1, code: 'C1', sections: ['C1-S1'] } },
    sections: { 'C1-S1': { id: 2, meeting_section: 'S1', offering_set: [1] } },
    offering_set: { 1: { id: 1, day: 'M' } },
  },
};

describe('course schema', () => {
  const normalized = course;
  const denormalized = [{
    id: 1, // course
    code: 'C1',
    sections: [{ // sections
      id: 2,
      meeting_section: 'S1',
      offering_set: [{ // offerings
        id: 1,
        day: 'M',
      }],
    }],
  }];
  it('normalizes course array (e.g. search results) correctly', () => {
    const result = normalize(denormalized, [schemas.courseSchema]);
    expect(result).toEqual(normalized);
  });
  it('normalizes single course correctly', () => {
    const result = normalize(denormalized[0], schemas.courseSchema);
    expect(result).toEqual({ ...normalized, result: 'C1' });
  });
  it('denormalizes single course correctly', () => {
    expect(getDenormCourseById(normalized.entities, 'C1')).toEqual(denormalized[0]);
  });
  it('normalizes timetable correctly', () => {
    const tt = { courses: denormalized, name: 'my_tt' };
    const result = normalize(tt, schemas.timetableSchema);
    const ttId = schemas.serializeTimetable(tt);
    expect(result).toEqual({
      result: ttId,
      entities: {
        ...normalized.entities,
        timetables: { [ttId]: { name: 'my_tt', courses: ['C1'] } },
      },
    });
  });
});

describe('timetable serializer', () => {
  it('serializes timetable with multiple sections and courses', () => {
    const courses = [
      { id: 'C1', sections: [{ id: 'S1' }, { id: 'S2' }, { id: 'S3' }] },
      { id: 'C2', sections: [{ id: 'S4' }] },
    ];
    expect(schemas.serializeTimetable({ courses })).toEqual('C1:S1,S2,S3;C2:S4');
  });
});