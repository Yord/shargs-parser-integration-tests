const argumentIsNotABool = ({values, defaultValues, index, option}) => ({
  code: 'ArgumentIsNotABool',
  msg:  "The passed command line argument must either be 'true' or 'false'.",
  info: {values, defaultValues, index, option}
})

const contradictionDetected = ({key, contradicts, option}) => ({
  code: 'ContradictionDetected',
  msg:  'Some given keys contradict each other.',
  info: {key, contradicts, option}
})

const didYouMean = ({argv, options}) => ({
  code: 'DidYouMean',
  msg:  'An unknown command-line argument was passed. Did you mean any of the following options?',
  info: {argv, options}
})

const falseArgsRules = ({rules, args}) => ({
  code: 'FalseArgsRules',
  msg:  'Your args rules returned false. Please abide to the rules defined in verifyArgs.',
  info: {rules, args}
})

const falseArgvRules = ({rules, argv}) => ({
  code: 'FalseArgvRules',
  msg:  'Your argv rules returned false. Please abide to the rules defined in verifyArgv.',
  info: {rules, argv}
})

const falseOptsRules = ({rules, options}) => ({
  code: 'FalseOptsRules',
  msg:  'Your opts rules returned false. Please abide to the rules defined in verifyOpts.',
  info: {rules, options}
})

const falseRules = ({key, rules, option}) => ({
  code: 'FalseRules',
  msg:  "An option's rules returned false. Please check your arguments.",
  info: {key, rules, option}
})

const implicationViolated = ({key, implies, option}) => ({
  code: 'ImplicationViolated',
  msg:  'Some given keys that imply each other are not all defined.',
  info: {key, implies, option}
})

const invalidRequiredPositionalArgument = ({positionalArguments}) => ({
  code: 'InvalidRequiredPositionalArgument',
  msg:  'If a positional argument is required, all previous positional arguments must be required as well. The required field must either be undefined, true or false.',
  info: {positionalArguments}
})

const requiredOptionMissing = ({key, option}) => ({
  code: 'RequiredOptionMissing',
  msg:  'An option that is marked as required has not been provided.',
  info: {key, option}
})

const subcommandRequired = ({options}) => ({
  code: 'SubcommandRequired',
  msg:  'No subcommand found. Please use at least one subcommand!',
  info: {options}
})

const unexpectedArgument = ({argument}) => ({
  code: 'UnexpectedArgument',
  msg:  'An unexpected argument was used that has no option defined.',
  info: {argument}
})

const valueRestrictionsViolated = ({key, values, index, only, option}) => ({
  code: 'ValueRestrictionsViolated',
  msg:  'A value lies outside the allowed values of an option.',
  info: {key, values, index, only, option}
})

module.exports = {
  argumentIsNotABool,
  contradictionDetected,
  didYouMean,
  falseArgsRules,
  falseArgvRules,
  falseOptsRules,
  falseRules,
  invalidRequiredPositionalArgument,
  implicationViolated,
  requiredOptionMissing,
  subcommandRequired,
  unexpectedArgument,
  valueRestrictionsViolated
}