const argumentIsNotABool = ({values, defaultValues, index, option}) => ({
  code: 'Argument is not a boolean',
  msg:  "The passed command line argument must either be 'true' or 'false'",
  info: {values, defaultValues, index, option}
})

const commandRequired = ({options}) => ({
  code: 'Command required',
  msg:  'No command found. Please use at least one command!',
  info: {options}
})

const contradictionDetected = ({key, contradicts, option}) => ({
  code: 'Contradiction detected',
  msg:  'Some given keys contradict each other.',
  info: {key, contradicts, option}
})

const didYouMean = ({argv, options}) => ({
  code: 'Did you mean',
  msg:  'An unknown command-line argument was passed. Did you mean any of the following options?',
  info: {argv, options}
})

const falseArgsRules = ({rules, args}) => ({
  code: 'False args rules',
  msg:  'Your args rules returned false. Please abide to the rules defined in verifyArgs.',
  info: {rules, args}
})

const falseArgvRules = ({rules, argv}) => ({
  code: 'False argv rules',
  msg:  'Your argv rules returned false. Please abide to the rules defined in verifyArgv.',
  info: {rules, argv}
})

const falseOptsRules = ({rules, options}) => ({
  code: 'False opts rules',
  msg:  'Your opts rules returned false. Please abide to the rules defined in verifyOpts.',
  info: {rules, options}
})

const falseRules = ({key, rules, option}) => ({
  code: 'False rules',
  msg:  "An option's rules returned false. Please check your arguments.",
  info: {key, rules, option}
})

const implicationViolated = ({key, implies, option}) => ({
  code: 'Implication violated',
  msg:  'Some given keys that imply each other are not all defined.',
  info: {key, implies, option}
})

const requiredOptionMissing = ({key, args, option}) => ({
  code: 'Required option is missing',
  msg:  'An option that is marked as required has not been provided.',
  info: {key, args, option}
})

const unexpectedArgument = ({argument}) => ({
  code: 'Unexpected argument',
  msg:  'An unexpected argument was used that has no option defined.',
  info: {argument}
})

const valueRestrictionsViolated = ({key, values, index, only, option}) => ({
  code: 'Value restriction violated',
  msg:  'A value lies outside the allowed values of an option.',
  info: {key, values, index, only, option}
})

module.exports = {
  argumentIsNotABool,
  commandRequired,
  contradictionDetected,
  didYouMean,
  falseArgsRules,
  falseArgvRules,
  falseOptsRules,
  falseRules,
  implicationViolated,
  requiredOptionMissing,
  unexpectedArgument,
  valueRestrictionsViolated
}