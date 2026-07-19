const fs = require('fs');
const path = require('path');

const filePath = path.join(__dirname, '../packages/persistence/src/index.ts');
let content = fs.readFileSync(filePath, 'utf8');

// We want to remove the legacy PostgresLearningResourceRepository definition.
// It starts with 'export class PostgresLearningResourceRepository implements LearningResourceRepository {'
// and ends with the class definition.
// Let's find the start of 'export class PostgresLearningResourceRepository implements LearningResourceRepository {'
// which comes AFTER our newly added exports.
const exportMarker = "export { PostgresLearningResourceRepository } from './learning-resource/postgres-learning-resource.repository';";
const markerIndex = content.indexOf(exportMarker);
if (markerIndex === -1) {
  console.error("New exports not found!");
  process.exit(1);
}

// Find the legacy class start after the marker
const searchStr = 'export class PostgresLearningResourceRepository implements LearningResourceRepository {';
const startIndex = content.indexOf(searchStr, markerIndex + exportMarker.length);
if (startIndex === -1) {
  console.error("Legacy class start not found!");
  process.exit(1);
}

// Now we find the end of the class. It ends right before 'export class PostgresQuestionRepository implements QuestionRepository {'
const nextClassStr = 'export class PostgresQuestionRepository implements QuestionRepository {';
const endIndex = content.indexOf(nextClassStr, startIndex);
if (endIndex === -1) {
  console.error("Next class PostgresQuestionRepository not found!");
  process.exit(1);
}

// Replace the content from startIndex to endIndex
const cleanedContent = content.substring(0, startIndex) + '\n' + content.substring(endIndex);
fs.writeFileSync(filePath, cleanedContent, 'utf8');
console.log("Successfully cleaned up legacy PostgresLearningResourceRepository from index.ts");
