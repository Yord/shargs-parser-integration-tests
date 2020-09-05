const {parserSync} = require('shargs')
const {
  arrayOnRepeat,
  bestGuessArgs,
  bestGuessCast,
  bestGuessOpts,
  broadenBools,
  cast,
  clearRest,
  contradictOpts,
  demandASubcommand,
  equalsSignAsSpace,
  failRest,
  flagsAsBools,
  flagsAsNumbers,
  implyOpts,
  mergeArgs,
  numberAsFlag,
  requireOpts,
  restrictToOnly,
  reverseBools,
  reverseFlags,
  setDefaultValues,
  shortOptsNoSpace,
  splitShortOpts,
  suggestOpts,
  traverseArgs,
  traverseArgv,
  traverseOpts,
  validatePosArgs,
  verifyArgs,
  verifyArgv,
  verifyOpts,
  verifyValuesArity
} = require('shargs-parser')

const {array, bool, subcommand, complement, flag, number, numberPos, command, string, stringPos} = require('shargs-opts')

const {
  argumentIsNotABool,
  contradictionDetected,
  didYouMean,
  falseArgsRules,
  falseArgvRules,
  falseOptsRules,
  implicationViolated,
  invalidRequiredPositionalArgument,
  requiredOptionMissing,
  subcommandRequired,
  unexpectedArgument,
  valueRestrictionsViolated
} = require('./errors')

const noCommands = opt => ({...opt, opts: opt.opts.filter(({opts}) => !Array.isArray(opts))})

const filterErrs = keys => errs => errs.map(
  ({info, ...rest}) => Object.keys(info).reduce(
    (acc, key) => ({
      ...acc,
      info: {
        ...acc.info,
        ...(keys.indexOf(key) === -1 ? {[key]: info[key]} : {[key]: undefined})
      }
    }),
    {info: {}, ...rest}
  )
)

const date = array(['date'])

const opts = [
  flag('help', ['--help']),
  flag('verbose', ['-v', '--verbose']),
  flag('popcorn', ['-l', '--low-fat'], {reverse: true}),
  bool('fantasy', ['-E', '--no-hobbits'], {reverse: true, implies: ['genre'], contradicts: ['popcorn']}),
  string('genre', ['-g', '--genre'], {required: true}),
  bool('smile', ['--smile'], {defaultValues: ['yes']}),
  date('date', ['--date'], {defaultValues: ['1977/05/25']}),
  stringPos('nums', {required: false}),
  numberPos('entries', {required: true}),
  subcommand([
    {key: 'stars', types: ['number'], args: ['-s', '--stars'], only: ['1', '2', '3', '4', '5']}
  ])('rate', ['rate']),
  string('query', ['-q', '--query'], {
    rules: title => opts => (
      !title.values[0].includes('Supersize Me') ||
      opts.some(_ => _.key === 'popcorn' && _.values.count === 0)
    )
  })
]

const script = command('deepThought', opts)

const argv = [
  '23',
  '42',
  '--query', 'Supersize Me',
  '--query', 'The Hobbit',
  '--colors',
  '-l',
  '--no-hobbits', 'true',
  '-vv',
  '--smile=no',
  'rate',
    '--stars', '8',
  '--help'
]

test('parserSync without stages works as expected', () => {
  const stages = {}

  const {errs, args} = parserSync(stages)(script)(argv)

  const expArgs = {
    _: ['--colors', '-vv', '--smile=no'],
    fantasy: 'true',
    help: {type: 'flag', count: 1},
    entries: '42',
    nums: '23',
    popcorn: {type: 'flag', count: 1},
    rate: {
      _: [],
      stars: '8'
    },
    query: 'Supersize Me'
  }

  const expErrs = []

  const errs2 = filterErrs([])(errs)

  expect(args).toStrictEqual(expArgs)
  expect(errs2).toStrictEqual(expErrs)
})

test('parserSync with only setDefaultValues works as expected', () => {
  const stages = {
    opts: [setDefaultValues]
  }

  const {errs, args} = parserSync(stages)(script)(argv)

  const expArgs = {
    _: ['--colors', '-vv', '--smile=no'],
    fantasy: 'true',
    help: {type: 'flag', count: 1},
    date: '1977/05/25',
    entries: '42',
    nums: '23',
    popcorn: {type: 'flag', count: 1},
    rate: {
      _: [],
      stars: '8'
    },
    query: 'Supersize Me',
    smile: 'yes'
  }

  const expErrs = []

  const errs2 = filterErrs([])(errs)

  expect(errs2).toStrictEqual(expErrs)
  expect(args).toStrictEqual(expArgs)
})

test('parserSync with only equalsSignAsSpace works as expected', () => {
  const stages = {
    argv: [equalsSignAsSpace]
  }

  const {errs, args} = parserSync(stages)(script)(argv)

  const expArgs = {
    _: ['--colors', '-vv'],
    fantasy: 'true',
    help: {type: 'flag', count: 1},
    entries: '42',
    nums: '23',
    popcorn: {type: 'flag', count: 1},
    rate: {
      _: [],
      stars: '8'
    },
    query: 'Supersize Me',
    smile: 'no'
  }

  const expErrs = []

  const errs2 = filterErrs([])(errs)

  expect(args).toStrictEqual(expArgs)
  expect(errs2).toStrictEqual(expErrs)
})

test('parserSync with shortOptsNoSpace works as expected', () => {
  const stages = {
    argv: [shortOptsNoSpace]
  }

  const {errs, args} = parserSync(stages)(script)(argv)

  const expArgs = {
    _: ['--colors', 'v', '--smile=no'],
    fantasy: 'true',
    help: {type: 'flag', count: 1},
    entries: '42',
    nums: '23',
    popcorn: {type: 'flag', count: 1},
    rate: {
      _: [],
      stars: '8'
    },
    query: 'Supersize Me',
    verbose: {type: 'flag', count: 1}
  }

  const expErrs = []

  const errs2 = filterErrs([])(errs)

  expect(args).toStrictEqual(expArgs)
  expect(errs2).toStrictEqual(expErrs)
})

test('parserSync with only splitShortOpts works as expected', () => {
  const stages = {
    argv: [splitShortOpts]
  }

  const {errs, args} = parserSync(stages)(script)(argv)

  const expArgs = {
    _: ['--colors', '--smile=no'],
    fantasy: 'true',
    help: {type: 'flag', count: 1},
    entries: '42',
    nums: '23',
    popcorn: {type: 'flag', count: 1},
    rate: {
      _: [],
      stars: '8'
    },
    query: 'Supersize Me',
    verbose: {type: 'flag', count: 2}
  }

  const expErrs = []

  const errs2 = filterErrs([])(errs)

  expect(args).toStrictEqual(expArgs)
  expect(errs2).toStrictEqual(expErrs)
})

test('parserSync with only traverseArgv works as expected', () => {
  const isArgvGroup = arg => arg.length > 2 && arg[0] === '-' && arg[1] !== '-'

  const splitArgvGroup = arg => ({
    argv: arg.split('').slice(1).map(c => '-' + c)
  })

  const stages = {
    argv: [traverseArgv(isArgvGroup)(splitArgvGroup)]
  }

  const {errs, args} = parserSync(stages)(script)(argv)

  const expArgs = {
    _: ['--colors', '--smile=no'],
    fantasy: 'true',
    help: {type: 'flag', count: 1},
    entries: '42',
    nums: '23',
    popcorn: {type: 'flag', count: 1},
    rate: {
      _: [],
      stars: '8'
    },
    query: 'Supersize Me',
    verbose: {type: 'flag', count: 2},
  }

  const expErrs = []

  const errs2 = filterErrs([])(errs)

  expect(args).toStrictEqual(expArgs)
  expect(errs2).toStrictEqual(expErrs)
})

test('parserSync with only verifyArgv works as expected', () => {
  const argvRules = argv => argv.some(_ => _ === '--fancy')

  const stages = {
    argv: [verifyArgv(argvRules)]
  }

  const {errs, args} = parserSync(stages)(script)(argv)

  const expArgs = {
    _: ['--colors', '-vv', '--smile=no'],
    fantasy: 'true',
    help: {type: 'flag', count: 1},
    entries: '42',
    nums: '23',
    popcorn: {type: 'flag', count: 1},
    rate: {
      _: [],
      stars: '8'
    },
    query: 'Supersize Me'
  }

  const expErrs = [
    falseArgvRules({argv})
  ]

  const errs2 = filterErrs(['rules'])(errs)

  expect(args).toStrictEqual(expArgs)
  expect(errs2).toStrictEqual(expErrs)
})

test('parserSync with only arrayOnRepeat works as expected', () => {
  const stages = {
    opts: [arrayOnRepeat]
  }

  const {errs, args} = parserSync(stages)(script)(argv)

  const expArgs = {
    _: ['--colors', '-vv', '--smile=no'],
    fantasy: 'true',
    help: {type: 'flag', count: 1},
    entries: '42',
    nums: '23',
    popcorn: {type: 'flag', count: 1},
    rate: {
      _: [],
      stars: '8'
    },
    query: ['Supersize Me', 'The Hobbit']
  }

  const expErrs = []

  const errs2 = filterErrs([])(errs)

  expect(args).toStrictEqual(expArgs)
  expect(errs2).toStrictEqual(expErrs)
})

test('parserSync with only bestGuessOpts works as expected', () => {
  const stages = {
    opts: [bestGuessOpts]
  }

  const {errs, args} = parserSync(stages)(script)(argv)

  const expArgs = {
    _: ['-vv'],
    fantasy: 'true',
    entries: '42',
    help: {type: 'flag', count: 1},
    nums: '23',
    popcorn: {type: 'flag', count: 1},
    rate: {
      _: [],
      stars: '8'
    },
    query: 'Supersize Me',
    'smile=no': {type: 'flag', count: 1},
    colors: {type: 'flag', count: 1}
  }

  const expErrs = []

  const errs2 = filterErrs([])(errs)

  expect(args).toStrictEqual(expArgs)
  expect(errs2).toStrictEqual(expErrs)
})

test('parserSync with only broadenBools works as expected', () => {
  const stages = {
    opts: [setDefaultValues, broadenBools({true: ['yes']})]
  }

  const {errs, args} = parserSync(stages)(script)(argv)

  const expArgs = {
    _: ['--colors', '-vv', '--smile=no'],
    fantasy: 'true',
    help: {type: 'flag', count: 1},
    date: '1977/05/25',
    entries: '42',
    nums: '23',
    popcorn: {type: 'flag', count: 1},
    rate: {
      _: [],
      stars: '8'
    },
    query: 'Supersize Me',
    smile: 'true'
  }

  const expErrs = []

  const errs2 = filterErrs([])(errs)

  expect(args).toStrictEqual(expArgs)
  expect(errs2).toStrictEqual(expErrs)
})

test('parserSync with only cast works as expected', () => {
  const stages = {
    opts: [setDefaultValues, cast]
  }

  const {errs, args} = parserSync(stages)(script)(argv)

  const expArgs = {
    _: ['--colors', '-vv', '--smile=no'],
    date: "1977/05/25",
    fantasy: true,
    help: {type: 'flag', count: 1},
    entries: 42,
    nums: '23',
    popcorn: {type: 'flag', count: 1},
    rate: {
      _: [],
      stars: 8
    },
    query: 'Supersize Me',
    smile: 'yes'
  }

  const expErrs = [
    argumentIsNotABool({values: ['yes'], index: 0})
  ]

  const errs2 = filterErrs(['option'])(errs)

  expect(args).toStrictEqual(expArgs)
  expect(errs2).toStrictEqual(expErrs)
})

test('parserSync with only contradictOpts works as expected', () => {
  const stages = {
    opts: [contradictOpts]
  }

  const {errs, args} = parserSync(stages)(script)(argv)

  const expArgs = {
    _: ['--colors', '-vv', '--smile=no'],
    fantasy: 'true',
    help: {type: 'flag', count: 1},
    entries: '42',
    nums: '23',
    popcorn: {type: 'flag', count: 1},
    rate: {
      _: [],
      stars: '8'
    },
    query: 'Supersize Me'
  }

  const expErrs = [
    contradictionDetected({key: 'fantasy', contradicts: ['popcorn']})
  ]

  const errs2 = filterErrs(['option'])(errs)

  expect(args).toStrictEqual(expArgs)
  expect(errs2).toStrictEqual(expErrs)
})

test('parserSync with only demandASubcommand works as expected if no subcommand is present', () => {
  const stages = {
    opts: [demandASubcommand]
  }

  const opts2 = noCommands(script)

  const {errs, args} = parserSync(stages)(opts2)(argv)

  const expArgs = {
    _: ['--colors', '-vv', '--smile=no', 'rate', '--stars', '8'],
    fantasy: 'true',
    help: {type: 'flag', count: 1},
    entries: '42',
    nums: '23',
    popcorn: {type: 'flag', count: 1},
    query: 'Supersize Me'
  }

  const expErrs = [
    subcommandRequired({})
  ]

  const errs2 = filterErrs(['options'])(errs)

  expect(args).toStrictEqual(expArgs)
  expect(errs2).toStrictEqual(expErrs)
})

test('parserSync with only demandASubcommand works as expected if a subcommand is present', () => {
  const checks = {
    opts: [demandASubcommand]
  }

  const stages = {}

  const {errs, args} = parserSync(stages, {checks})(script)(argv)

  const expArgs = {
    _: ['--colors', '-vv', '--smile=no'],
    fantasy: 'true',
    help: {type: 'flag', count: 1},
    entries: '42',
    nums: '23',
    popcorn: {type: 'flag', count: 1},
    rate: {
      _: [],
      stars: '8'
    },
    query: 'Supersize Me'
  }

  const expErrs = []

  const errs2 = filterErrs([])(errs)

  expect(args).toStrictEqual(expArgs)
  expect(errs2).toStrictEqual(expErrs)
})

test('parserSync with only implyOpts works as expected', () => {
  const stages = {
    opts: [implyOpts]
  }

  const {errs, args} = parserSync(stages)(script)(argv)

  const expArgs = {
    _: ['--colors', '-vv', '--smile=no'],
    fantasy: 'true',
    help: {type: 'flag', count: 1},
    entries: '42',
    nums: '23',
    popcorn: {type: 'flag', count: 1},
    rate: {
      _: [],
      stars: '8'
    },
    query: 'Supersize Me'
  }

  const expErrs = [
    implicationViolated({key: 'fantasy', implies: ['genre']})
  ]

  const errs2 = filterErrs(['option'])(errs)

  expect(args).toStrictEqual(expArgs)
  expect(errs2).toStrictEqual(expErrs)
})

test('parserSync with only requireOpts works as expected', () => {
  const stages = {
    opts: [requireOpts]
  }

  const {errs, args} = parserSync(stages)(script)(argv)

  const expArgs = {
    _: ['--colors', '-vv', '--smile=no'],
    fantasy: 'true',
    help: {type: 'flag', count: 1},
    entries: '42',
    nums: '23',
    popcorn: {type: 'flag', count: 1},
    rate: {
      _: [],
      stars: '8'
    },
    query: 'Supersize Me'
  }

  const expErrs = [
    requiredOptionMissing({key: 'genre'})
  ]

  const errs2 = filterErrs(['option'])(errs)

  expect(args).toStrictEqual(expArgs)
  expect(errs2).toStrictEqual(expErrs)
})

test('parserSync with only restrictToOnly works as expected', () => {
  const stages = {
    opts: [restrictToOnly]
  }

  const {errs, args} = parserSync(stages)(script)(argv)

  const expArgs = {
    _: ['--colors', '-vv', '--smile=no'],
    fantasy: 'true',
    help: {type: 'flag', count: 1},
    entries: '42',
    nums: '23',
    popcorn: {type: 'flag', count: 1},
    rate: {
      _: [],
      stars: '8'
    },
    query: 'Supersize Me'
  }

  const expErrs = [
    valueRestrictionsViolated({key: 'stars', values: ['8'], index: 0, only: ['1', '2', '3', '4', '5']})
  ]

  const errs2 = filterErrs(['option'])(errs)

  expect(args).toStrictEqual(expArgs)
  expect(errs2).toStrictEqual(expErrs)
})

test('parserSync with only reverseBools works as expected', () => {
  const stages = {
    opts: [reverseBools]
  }

  const {errs, args} = parserSync(stages)(script)(argv)

  const expArgs = {
    _: ['--colors', '-vv', '--smile=no'],
    fantasy: 'false',
    help: {type: 'flag', count: 1},
    entries: '42',
    nums: '23',
    popcorn: {type: 'flag', count: 1},
    rate: {
      _: [],
      stars: '8'
    },
    query: 'Supersize Me'
  }

  const expErrs = []

  const errs2 = filterErrs([])(errs)

  expect(args).toStrictEqual(expArgs)
  expect(errs2).toStrictEqual(expErrs)
})

test('parserSync with only reverseFlags works as expected', () => {
  const stages = {
    opts: [reverseFlags]
  }

  const {errs, args} = parserSync(stages)(script)(argv)

  const expArgs = {
    _: ['--colors', '-vv', '--smile=no'],
    fantasy: 'true',
    help: {type: 'flag', count: 1},
    entries: '42',
    nums: '23',
    popcorn: {type: 'flag', count: -1},
    rate: {
      _: [],
      stars: '8'
    },
    query: 'Supersize Me'
  }

  const expErrs = []

  const errs2 = filterErrs([])(errs)

  expect(args).toStrictEqual(expArgs)
  expect(errs2).toStrictEqual(expErrs)
})

test('parserSync with only suggestOpts works as expected', () => {
  const stages = {
    opts: [suggestOpts]
  }

  const {errs, args} = parserSync(stages)(script)(argv)

  const expArgs = {
    _: ['--colors', '-vv', '--smile=no'],
    fantasy: 'true',
    help: {type: 'flag', count: 1},
    entries: '42',
    nums: '23',
    popcorn: {type: 'flag', count: 1},
    rate: {
      _: [],
      stars: '8'
    },
    query: 'Supersize Me'
  }

  const expErrs = [
    didYouMean({argv: '--colors'}),
    didYouMean({argv: '-vv'}),
    didYouMean({argv: '--smile=no'})
  ]

  const errs2 = filterErrs(['options'])(errs)

  expect(args).toStrictEqual(expArgs)
  expect(errs2).toStrictEqual(expErrs)
})

test('parserSync with only traverseOpts works as expected', () => {
  const isFlag = ({types}) => Array.isArray(types) && types.length === 0

  const hasValidValues = ({values}) => Array.isArray(values) && values.length === 1

  const reverseFlags = opt => ({
    opts: [
      {...opt, values: [-opt.values[0]]}
    ]
  })

  const stages = {
    opts: [
      traverseOpts(opt => isFlag(opt) && hasValidValues(opt))(reverseFlags)
    ]
  }

  const {errs, args} = parserSync(stages)(script)(argv)

  const expArgs = {
    _: ['--colors', '-vv', '--smile=no'],
    fantasy: 'true',
    help: {type: 'flag', count: -1},
    entries: '42',
    nums: '23',
    popcorn: {type: 'flag', count: -1},
    rate: {
      _: [],
      stars: '8'
    },
    query: 'Supersize Me'
  }

  const expErrs = []

  const errs2 = filterErrs([])(errs)

  expect(args).toStrictEqual(expArgs)
  expect(errs2).toStrictEqual(expErrs)
})

test('parserSync with only validatePosArgs works as expected', () => {
  const stages = {
    opts: [validatePosArgs]
  }

  const {errs, args} = parserSync(stages)(script)(argv)

  const expArgs = {
    _: ['--colors', '-vv', '--smile=no'],
    fantasy: 'true',
    help: {type: 'flag', count: 1},
    entries: '42',
    nums: '23',
    popcorn: {type: 'flag', count: 1},
    rate: {
      _: [],
      stars: '8'
    },
    query: 'Supersize Me'
  }

  const expErrs = [
    invalidRequiredPositionalArgument({})
  ]

  const errs2 = filterErrs(['positionalArguments'])(errs)

  expect(args).toStrictEqual(expArgs)
  expect(errs2).toStrictEqual(expErrs)
})

test('parserSync with only verifyOpts works as expected', () => {
  const optsRules = opts => (
    !opts.some(_ => _.key === 'genre') ||
    opts.every(_ => _.key !== 'genre' || _.values)
  )

  const stages = {
    opts: [verifyOpts(optsRules)]
  }

  const {errs, args} = parserSync(stages)(script)(argv)

  const expArgs = {
    _: ['--colors', '-vv', '--smile=no'],
    fantasy: 'true',
    help: {type: 'flag', count: 1},
    entries: '42',
    nums: '23',
    popcorn: {type: 'flag', count: 1},
    rate: {
      _: [],
      stars: '8'
    },
    query: 'Supersize Me'
  }

  const expErrs = [
    falseOptsRules({})
  ]

  const errs2 = filterErrs(['options', 'rules'])(errs)

  expect(args).toStrictEqual(expArgs)
  expect(errs2).toStrictEqual(expErrs)
})

test('parserSync with only verifyValuesArity works as expected', () => {
  const stages = {
    opts: [verifyValuesArity]
  }

  const {errs, args} = parserSync(stages)(script)(argv)

  const expArgs = {
    _: ['--colors', '-vv', '--smile=no'],
    fantasy: 'true',
    help: {type: 'flag', count: 1},
    entries: '42',
    nums: '23',
    popcorn: {type: 'flag', count: 1},
    rate: {
      _: [],
      stars: '8'
    },
    query: 'Supersize Me'
  }

  const expErrs = []

  const errs2 = filterErrs(['option'])(errs)

  expect(args).toStrictEqual(expArgs)
  expect(errs2).toStrictEqual(expErrs)
})

test('parserSync with only bestGuessArgs works as expected', () => {
  const stages = {
    args: [bestGuessArgs]
  }

  const {errs, args} = parserSync(stages)(script)(argv)

  const expArgs = {
    _: ['-vv'],
    colors: {type: 'flag', count: 1},
    fantasy: 'true',
    help: {type: 'flag', count: 1},
    entries: '42',
    nums: '23',
    popcorn: {type: 'flag', count: 1},
    rate: {
      _: [],
      stars: '8'
    },
    query: 'Supersize Me',
    'smile=no': {type: 'flag', count: 1},
  }

  const expErrs = []

  const errs2 = filterErrs([])(errs)

  expect(args).toStrictEqual(expArgs)
  expect(errs2).toStrictEqual(expErrs)
})

test('parserSync with only bestGuessCast works as expected', () => {
  const stages = {
    args: [bestGuessCast]
  }

  const {errs, args} = parserSync(stages)(script)(argv)

  const expArgs = {
    _: ['--colors', '-vv', '--smile=no'],
    fantasy: true,
    help: {type: 'flag', count: 1},
    entries: 42,
    nums: 23,
    popcorn: {type: 'flag', count: 1},
    rate: {
      _: [],
      stars: 8
    },
    query: 'Supersize Me'
  }

  const expErrs = []

  const errs2 = filterErrs([])(errs)

  expect(args).toStrictEqual(expArgs)
  expect(errs2).toStrictEqual(expErrs)
})

test('parserSync with only clearRest works as expected', () => {
  const stages = {
    args: [clearRest]
  }

  const {errs, args} = parserSync(stages)(script)(argv)

  const expArgs = {
    _: [],
    fantasy: 'true',
    help: {type: 'flag', count: 1},
    entries: '42',
    nums: '23',
    popcorn: {type: 'flag', count: 1},
    rate: {
      _: [],
      stars: '8'
    },
    query: 'Supersize Me'
  }

  const expErrs = []

  const errs2 = filterErrs([])(errs)

  expect(args).toStrictEqual(expArgs)
  expect(errs2).toStrictEqual(expErrs)
})

test('parserSync with only failRest works as expected', () => {
  const stages = {
    args: [failRest]
  }

  const {errs, args} = parserSync(stages)(script)(argv)

  const expArgs = {
    _: ['--colors', '-vv', '--smile=no'],
    fantasy: 'true',
    help: {type: 'flag', count: 1},
    entries: '42',
    nums: '23',
    popcorn: {type: 'flag', count: 1},
    rate: {
      _: [],
      stars: '8'
    },
    query: 'Supersize Me'
  }

  const expErrs = [
    unexpectedArgument({argument: '--colors'}),
    unexpectedArgument({argument: '-vv'}),
    unexpectedArgument({argument: '--smile=no'})
  ]

  const errs2 = filterErrs([])(errs)

  expect(args).toStrictEqual(expArgs)
  expect(errs2).toStrictEqual(expErrs)
})

test('parserSync with only flagsAsBools works as expected', () => {
  const stages = {
    args: [flagsAsBools]
  }

  const {errs, args} = parserSync(stages)(script)(argv)

  const expArgs = {
    _: ['--colors', '-vv', '--smile=no'],
    fantasy: 'true',
    help: true,
    entries: '42',
    nums: '23',
    popcorn: true,
    rate: {
      _: [],
      stars: '8'
    },
    query: 'Supersize Me'
  }

  const expErrs = []

  const errs2 = filterErrs([])(errs)

  expect(args).toStrictEqual(expArgs)
  expect(errs2).toStrictEqual(expErrs)
})

test('parserSync with only flagsAsNumbers works as expected', () => {
  const stages = {
    args: [flagsAsNumbers]
  }

  const {errs, args} = parserSync(stages)(script)(argv)

  const expArgs = {
    _: ['--colors', '-vv', '--smile=no'],
    fantasy: 'true',
    help: 1,
    entries: '42',
    nums: '23',
    popcorn: 1,
    rate: {
      _: [],
      stars: '8'
    },
    query: 'Supersize Me'
  }

  const expErrs = []

  const errs2 = filterErrs([])(errs)

  expect(args).toStrictEqual(expArgs)
  expect(errs2).toStrictEqual(expErrs)
})

test('parserSync with only mergeArgs works as expected', () => {
  const stages = {
    args: [mergeArgs()]
  }

  const {errs, args} = parserSync(stages)(script)(argv)

  const expArgs = {
    _: ['--colors', '-vv', '--smile=no'],
    fantasy: 'true',
    help: {type: 'flag', count: 1},
    entries: '42',
    nums: '23',
    popcorn: {type: 'flag', count: 1},
    stars: '8',
    query: 'Supersize Me'
  }

  const expErrs = []

  const errs2 = filterErrs([])(errs)

  expect(args).toStrictEqual(expArgs)
  expect(errs2).toStrictEqual(expErrs)
})

test('parserSync with only numberAsFlag works as expected', () => {
  const stages = {
    opts: [cast],
    args: [numberAsFlag('entries')]
  }

  const {errs, args} = parserSync(stages)(script)(argv)

  const expArgs = {
    _: ['--colors', '-vv', '--smile=no'],
    fantasy: true,
    help: {type: 'flag', count: 1},
    entries: {type: 'flag', count: 42},
    nums: '23',
    popcorn: {type: 'flag', count: 1},
    rate: {
      _: [],
      stars: 8
    },
    query: 'Supersize Me'
  }

  const expErrs = []

  const errs2 = filterErrs([])(errs)

  expect(args).toStrictEqual(expArgs)
  expect(errs2).toStrictEqual(expErrs)
})

test('parserSync with only traverseArgs works as expected', () => {
  const stages = {
    args: [
      traverseArgs({
        flag: ({key, errs, args}) => ({
          errs,
          args: key !== 'popcorn' ? args : {...args, popcorn: true}
        })
      })
    ]
  }

  const {errs, args} = parserSync(stages)(script)(argv)

  const expArgs = {
    _: ['--colors', '-vv', '--smile=no'],
    fantasy: 'true',
    help: {type: 'flag', count: 1},
    entries: '42',
    nums: '23',
    popcorn: true,
    rate: {
      _: [],
      stars: '8'
    },
    query: 'Supersize Me'
  }

  const expErrs = []

  const errs2 = filterErrs([])(errs)

  expect(args).toStrictEqual(expArgs)
  expect(errs2).toStrictEqual(expErrs)
})

test('parserSync with only verifyArgs works as expected', () => {
  const argsRules = args => !args.query || args.query.indexOf('Terminator') > -1

  const stages = {
    args: [verifyArgs(argsRules)]
  }

  const {errs, args} = parserSync(stages)(script)(argv)

  const expArgs = {
    _: ['--colors', '-vv', '--smile=no'],
    fantasy: 'true',
    help: {type: 'flag', count: 1},
    entries: '42',
    nums: '23',
    popcorn: {type: 'flag', count: 1},
    rate: {
      _: [],
      stars: '8'
    },
    query: 'Supersize Me'
  }

  const expErrs = [
    falseArgsRules({})
  ]

  const errs2 = filterErrs(['rules', 'args'])(errs)

  expect(args).toStrictEqual(expArgs)
  expect(errs2).toStrictEqual(expErrs)
})

test('parserSync with substages for the rate subcommand works as expected', () => {
  const rules = args => !args.query || args.query.indexOf('Terminator') > -1

  const stages = {
    args: [verifyArgs(rules)]
  }

  const substages = {
    rate: [cast]
  }

  const {errs, args} = parserSync(stages, substages)(script)(argv)

  const expArgs = {
    _: ['--colors', '-vv', '--smile=no'],
    fantasy: 'true',
    help: {type: 'flag', count: 1},
    entries: '42',
    nums: '23',
    popcorn: {type: 'flag', count: 1},
    rate: {
      _: [],
      stars: 8
    },
    query: 'Supersize Me'
  }

  const expErrs = [
    falseArgsRules({})
  ]

  const errs2 = filterErrs(['rules', 'args'])(errs)

  expect(args).toStrictEqual(expArgs)
  expect(errs2).toStrictEqual(expErrs)
})

test('parserSync with custom stages works as expected', () => {
  const flatMap = (f, arr) => arr.reduce((acc, value) => [...acc, ...f(value)], [])

  function splitShortOpts ({errs = [], argv = []} = {}) {
    const argv2 = flatMap(
      arg => arg.length > 2 && arg[0] === '-' && arg[1] !== '-'
        ? arg.slice(1).split('').map(c => '-' + c)
        : [arg],
      argv
    )

    return {errs, argv: argv2}
  }

  function setDefaultValues ({errs = [], opts = []} = {}) {
    const setValues = opt => (
      typeof opt.key === 'string' &&
      typeof opt.values === 'undefined' &&
      Array.isArray(opt.defaultValues)
    )

    return {
      errs,
      opts: opts.map(opt => ({
        ...opt,
        ...(setValues(opt) ? {values: opt.defaultValues} : {})
      }))
    }
  }

  function flagsAsBools ({errs = [], args = {}} = {}) {
    const fs = {
      flag: ({key, val, errs, args}) => ({
        errs,
        args: {...args, [key]: val.count > 0}
      })
    }

    const {errs: errs2, args: args2} = traverseArgs(fs)({args})

    return {errs: errs.concat(errs2), args: args2}
  }

  function dateToYear ({errs = [], opts = []} = {}) {
    const isDate = ({types}) => (
      Array.isArray(types) &&
      types.length === 1 &&
      types[0] === 'date'
    )
  
    const toYear = string => typeof string === 'string' ? new Date(string).getFullYear() : string
  
    const dateToYear = opt => ({
      opts: [{
        ...opt,
        ...(Array.isArray(opt.values)
            ? {values: opt.values.map(toYear)}
            : {}
        )
      }]
    })
  
    return traverseOpts(isDate)(dateToYear)({errs, opts})
  }

  const stages = {
    argv: [splitShortOpts],
    opts: [setDefaultValues, dateToYear],
    args: [flagsAsBools]
  }

  const {errs, args} = parserSync(stages)(script)(argv)

  const expArgs = {
    _: ['--colors', '--smile=no'],
    fantasy: 'true',
    help: true,
    date: 1977,
    entries: '42',
    nums: '23',
    popcorn: true,
    rate: {
      _: [],
      stars: '8'
    },
    query: 'Supersize Me',
    smile: 'yes',
    verbose: true
  }

  const expErrs = []

  const errs2 = filterErrs([])(errs)

  expect(args).toStrictEqual(expArgs)
  expect(errs2).toStrictEqual(expErrs)
})

test('parserSync works with complex stages setup', () => {
  const argvRules = argv => argv.some(_ => _ === '--fancy')

  const optsRules = opts => (
    !opts.some(_ => _.key === 'genre') ||
    opts.every(_ => _.key !== 'genre' || _.values)
  )

  const argsRules = args => !args.query || args.query.indexOf('Terminator') > -1

  const stages = {
    argv: [
      verifyArgv(argvRules),
      equalsSignAsSpace,
      splitShortOpts
    ],
    opts: [
      setDefaultValues,
      requireOpts,
      verifyOpts(optsRules),
      verifyValuesArity,
      implyOpts,
      contradictOpts,
      validatePosArgs,
      restrictToOnly,
      broadenBools({true: ['yes'], false: ['no']}),
      reverseBools,
      reverseFlags,
      suggestOpts,
      cast,
      arrayOnRepeat
    ],
    args: [
      failRest,
      verifyArgs(argsRules),
      mergeArgs(),
      traverseArgs({
        flag: ({key, val: {count}, errs, args}) => ({
          errs,
          args: {...args, [key]: key === 'verbose' ? count : count > 0}
        })
      })
    ]
  }

  const {errs, args} = parserSync(stages)(script)(argv)

  const expArgs = {
    _: ['--colors'],
    fantasy: false,
    help: true,
    date: '1977/05/25',
    entries: 42,
    nums: '23',
    popcorn: false,
    query: ['Supersize Me', 'The Hobbit'],
    smile: false,
    stars: 8,
    verbose: 2
  }

  const expErrs = [
    falseArgvRules({argv}),
    requiredOptionMissing({key: 'genre'}),
    falseOptsRules({}),
    implicationViolated({key: 'fantasy', implies: ['genre']}),
    contradictionDetected({key: 'fantasy', contradicts: ['popcorn']}),
    invalidRequiredPositionalArgument({}),
    didYouMean({argv: '--colors'}),
    valueRestrictionsViolated({key: 'stars', values: ['8'], index: 0, only: ['1', '2', '3', '4', '5']}),
    unexpectedArgument({argument: '--colors'}),
    falseArgsRules({})
  ]

  const errs2 = filterErrs(['args', 'options', 'option', 'positionalArguments', 'rules'])(errs)

  expect(args).toStrictEqual(expArgs)
  expect(errs2).toStrictEqual(expErrs)
})

// demandASubcommand
// shortOptsNoSpace
// bestGuessOpts
// bestGuessArgs
// bestGuessCast
// clearRest
// flagsAsBools
// flagsAsNumbers

test('parserSync works with complement', () => {
  const tired     = {key: 'tired', types: ['bool'], args: ['-t', '--tired'], defaultValues: ['true']}
  const notTired  = complement('--not-')(tired)
  const badLuck   = {key: 'badLuck', types: [], args: ['--luck'], reverse: true}
  const noBadLuck = complement('--no-')(badLuck)

  const script = command('complement', [
    tired,
    notTired,
    badLuck,
    noBadLuck
  ])

  const stages = {
    opts: [reverseBools, reverseFlags, cast],
    args: [flagsAsBools]
  }

  const parse = parserSync(stages)(script)

  const argv = ['--not-tired', 'true', '--no-luck']

  const {errs, args} = parse(argv)

  const expErrs = []

  const expArgs = {
    _: [],
    badLuck: true,
    tired: false
  }

  expect(args).toStrictEqual(expArgs)
  expect(errs).toStrictEqual(expErrs)
})

test('FAQ comma-separated example works', () => {
  const isCommas = ({key, types, values}) => (
    typeof key !== 'undefined' &&
    Array.isArray(types) && types.length === 1 && types[0] === 'commas' &&
    Array.isArray(values) && values.length === 1
  )

  const transformCommaArray = opt => {
    const value = opt.values[0]
    const values = value.split(',')
    const types = Array.from({length: values.length}, () => 'string')

    return {opts: [{...opt, types, values}]}
  }

  const splitCommas = traverseOpts(isCommas)(transformCommaArray)

  const commas = array(['commas'])

  const foo = commas('foo', ['--foo'])

  const script = command('foo', [foo])

  const stages = {
    opts: [splitCommas]
  }

  const parse = parserSync(stages)(script)

  expect(
    parse(['--foo', '1,2,3,4,5']).args
  ).toStrictEqual({
    _: [],
    foo: ['1', '2', '3', '4', '5']
  })
})

test('FAQ 0..1 example works', () => {
  const funOpts = [
    stringPos('threeValues')
  ]

  const fun = subcommand(funOpts)('fun', ['--fun'], {threeValued: true})
  const answer = number('answer', ['-a'])

  const cmd = command('cmd', [answer, fun])

  const isThreeValued = ({threeValued}) => threeValued === true

  const toThreeValued = opt => {
    const types = ['threeValued']

    let values = ['unknown']

    if (Array.isArray(opt.values)) {
      const threeValues = opt.values.find(opt => opt.key === 'threeValues')
      values = threeValues.values || ['true']
    }

    return {
      opts: [
        {...opt, types, values: values.slice(0, 1), opts: undefined}
      ]
    }
  }

  const subcommandsToThreeValued = traverseOpts(isThreeValued)(toThreeValued)

  const stages = {
    opts: [subcommandsToThreeValued]
  }

  const parse = parserSync(stages)(cmd)
  
  expect(
    parse(['--fun']).args
  ).toStrictEqual({
    _: [],
    fun: 'true'
  })

  expect(
    parse(['--fun', '-a', '42']).args
  ).toStrictEqual({
    _: [],
    fun: 'true',
    answer: '42'
  })

  expect(
    parse(['--fun', 'true']).args
  ).toStrictEqual({
    _: [],
    fun: 'true'
  })

  expect(
    parse(['--fun', 'false']).args
  ).toStrictEqual({
    _: [],
    fun: 'false'
  })

  expect(
    parse(['--fun', 'unknown']).args
  ).toStrictEqual({
    _: [],
    fun: 'unknown'
  })

  expect(
    parse([]).args
  ).toStrictEqual({
    _: [],
    fun: 'unknown'
  })
})

test('FAQ nest example works', () => {
  function traverseKeys (p) {
    return f => args => Object.keys(args).reduce(
      (obj, key) => {
        const val = args[key]
        if (!Array.isArray(val) && typeof val === 'object') {
          obj[key] = traverseKeys(p)(f)(val)
        }
        if (p(key)) {
          const {[key]: _, ...rest} = obj
          obj = {...rest, ...f(key, val)}
        }
        return obj
      },
      args
    )
  }

  const set = (obj, path, val) => {
    if (path === 'a.b') return {...obj, a: {b: val}}
    else return obj
  }

  const hasDots = key => key.indexOf('.') > -1

  const nestValue = (key, val) => {
    return set({}, key, val)
  }

  const nestKeys = traverseKeys(hasDots)(nestValue)

  const ab = string('a.b', ['--ab'])
  const c  = subcommand([ab])('c', ['c'])

  const script = command('foo', [ab, c])

  const stages = {
    args: [nestKeys]
  }

  const parse = parserSync(stages)(script)

  expect(
    parse(['--ab', 'test', 'c', '--ab', 'test2']).args
  ).toStrictEqual({
    _: [],
    a: {b: 'test'},
    c: {
      _: [],
      a: {b: 'test2'}
    }
  })
})