# Change Log

All notable changes to this project will be documented in this file. See [standard-version](https://github.com/conventional-changelog/standard-version) for commit guidelines.

<a name="1.4.4"></a>
## [1.4.4](https://github.com/iarna/require-inject/compare/v1.4.3...v1.4.4) (2018-12-25)


### Bug Fixes

* **loaded:** Ensure mocked module’s loaded state is set. ([#17](https://github.com/iarna/require-inject/issues/17)) ([25cac11](https://github.com/iarna/require-inject/commit/25cac11))



## v1.4.3 (2018-05-04)

Mocked module will now actually be an instance of Module (thanks [@jdalton](https://github.com/jdalton)!)

When the code loaded via `requireInject` resulted in `readable-stream` being
loaded anywhere down the require chain would produce failures in
`readable-stream`'s instanceof checks resulting in crashes.  This has been
worked around by preloading `readable-stream` when it is available.  This
won't fix 100% of cases but it will fix the problem most of the time.  If it
doesn't fix it for you, try adding `readable-stream` as a dev dep.

## v1.4.2 (2017-06-27)

Made `mocks` in `requireInject( module, mocks )` an optional argument.

## v1.4.0 (2016-06-03)

Add `requireInject.withEmptyCache` and
`requireInject.installGlobally.andClearCache` to support loading modules
to be injected with an empty cache. This can be useful when your test shares
dependencies with the module to be mocked and you need to mock a transitive
dependency of one of those dependencies. That is:

```
Test → A → B

ModuleToTest → A → MockedB
```

If we we didn't clear the cache then `ModuleToTest` would get the already
cached version of `A` and the `MockedB` would never be injected. By clearing the cache
first it means that `ModuleToTest` will get it's own copy of `A` which will then pick
up any mocks we defined.

Previously to achieve this you would need to have provided a mock for `A`,
which, if that isn't what you were testing, could be frustrating busy work.

## v1.3.1 (2016-03-04)

Properly support relative module paths.

Previously you could use them, but they would be relative to where
`require-inject` was installed.  Now they're relative to your test script. 
(I failed to notice this for so long because, through sheer coicidence, the
relative path from my own test scripts was the same as the one from
`require-inject`, but that wouldn't ordinarily be the case.)

Many, many thanks to [@jcollado](https://github.com/jcollado) who provided
the patch, with tests and was kind enough to convince me that this really
wasn't working as intended.
