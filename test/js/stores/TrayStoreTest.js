jest.dontMock('../../../src/js/stores/TrayStore')
  .dontMock('../../../src/js/constants/NevergreenConstants')

describe('tray store', () => {

  let store, AppDispatcher, Constants, callback, nameGenerator

  beforeEach(() => {
    AppDispatcher = require('../../../src/js/dispatcher/AppDispatcher')
    Constants = require('../../../src/js/constants/NevergreenConstants')
    store = require('../../../src/js/stores/TrayStore')
    nameGenerator = require('project-name-generator')
    callback = AppDispatcher.register.mock.calls[0][0]

    callback({
      type: Constants.AppInit,
      configuration: {}
    })

    nameGenerator.mockReturnValue({
      spaced: 'some generated name'
    })
  })

  it('registers a callback with the dispatcher', () => {
    expect(AppDispatcher.register.mock.calls.length).toBe(1)
  })

  it('adds a tray', () => {
    callback({
      type: Constants.TrayAdd,
      trayId: 'some-id',
      url: 'some-url',
      username: 'some-username'
    })
    expect(store.getById('some-id')).toEqual({
      trayId: 'some-id',
      name: 'Some Generated Name',
      url: 'some-url',
      username: 'some-username'
    })
  })

  describe('once a tray is added', () => {
    beforeEach(() => {
      callback({
        type: Constants.TrayAdd,
        trayId: 'some-id',
        url: 'some-url',
        username: 'some-username'
      })
    })

    it('updates a tray', () => {
      callback({
        type: Constants.TrayUpdate,
        trayId: 'some-id',
        name: 'some-name',
        url: 'another-url',
        username: 'another-username'
      })
      expect(store.getById('some-id')).toEqual({
        trayId: 'some-id',
        name: 'some-name',
        url: 'another-url',
        username: 'another-username'
      })
    })

    it('removes a tray', () => {
      callback({
        type: Constants.TrayRemove,
        trayId: 'some-id'
      })
      expect(store.getById('some-id')).toBeUndefined()
    })

    it('sets the fetching flag to true while fetching', () => {
      callback({
        type: Constants.ProjectsFetching,
        trayId: 'some-id'
      })
      expect(store.getById('some-id').fetching).toBeTruthy()
    })

    it('clears the error object while fetching', () => {
      callback({
        type: Constants.ProjectsFetching,
        trayId: 'some-id'
      })
      expect(store.getById('some-id').error).toBeNull()
    })

    it('sets the fetching flag to false when fetched', () => {
      callback({
        type: Constants.ProjectsFetched,
        trayId: 'some-id'
      })
      expect(store.getById('some-id').fetching).toBeFalsy()
    })

    it('clears the error object once fetched', () => {
      callback({
        type: Constants.ProjectsFetched,
        trayId: 'some-id'
      })
      expect(store.getById('some-id').error).toBeNull()
    })

    it('sets the error object on api error', () => {
      callback({
        type: Constants.ProjectsFetchError,
        trayId: 'some-id',
        error: 'some-error'
      })
      expect(store.getById('some-id').error).toEqual('some-error')
    })

    it('sets the fetching flag to false on error', () => {
      callback({
        type: Constants.ProjectsFetchError,
        trayId: 'some-id'
      })
      expect(store.getById('some-id').fetching).toBeFalsy()
    })
  })

  it('clears the store state when new data is imported', () => {
    callback({
      type: Constants.ImportedData
    })
    expect(store.getAll()).toEqual([])
  })

  describe('validation', () => {
    it('returns an error message if the storage key does not exist', () => {
      const obj = {}
      expect(store.validate(obj)).toEqual([jasmine.any(String)])
    })

    it('returns an error message if the trays key does not exist', () => {
      const obj = {
        success: {}
      }
      expect(store.validate(obj)).toEqual([jasmine.any(String)])
    })

    it('returns an error message if the trays key is not an object', () => {
      const obj = {
        success: {
          trays: 'not-an-object'
        }
      }
      expect(store.validate(obj)).toEqual([jasmine.any(String)])
    })
  })

})
