import { describe, expect, it, vi, beforeEach, afterEach } from 'vitest';
import { TestBed } from '@angular/core/testing';

import { ThemeService } from './theme.service';

describe('ThemeService', () => {
  let service: ThemeService;
  let localStorageMock: { [key: string]: string };
  let matchMediaMock: ReturnType<typeof vi.fn>;

  beforeEach(() => {
    // Reset localStorage mock
    localStorageMock = {};
    vi.stubGlobal('localStorage', {
      getItem: vi.fn((key: string) => localStorageMock[key] ?? null),
      setItem: vi.fn((key: string, value: string) => {
        localStorageMock[key] = value;
      }),
      removeItem: vi.fn((key: string) => {
        delete localStorageMock[key];
      }),
    });

    // Mock matchMedia for system preference detection
    matchMediaMock = vi.fn().mockReturnValue({
      matches: false,
      addEventListener: vi.fn(),
      removeEventListener: vi.fn(),
    });
    vi.stubGlobal('matchMedia', matchMediaMock);

    // Mock document.documentElement
    vi.stubGlobal('document', {
      documentElement: {
        classList: {
          add: vi.fn(),
          remove: vi.fn(),
        },
      },
    });
  });

  afterEach(() => {
    vi.unstubAllGlobals();
    TestBed.resetTestingModule();
  });

  describe('initialization', () => {
    it('should use stored theme from localStorage', () => {
      localStorageMock['app_theme'] = 'dark';

      TestBed.configureTestingModule({});
      service = TestBed.inject(ThemeService);

      expect(service.theme()).toBe('dark');
    });

    it('should use light theme as default when no stored value', () => {
      TestBed.configureTestingModule({});
      service = TestBed.inject(ThemeService);

      expect(service.theme()).toBe('light');
    });

    it('should detect dark system preference when no stored value', () => {
      matchMediaMock.mockReturnValue({ matches: true });

      TestBed.configureTestingModule({});
      service = TestBed.inject(ThemeService);

      expect(service.theme()).toBe('dark');
      expect(matchMediaMock).toHaveBeenCalledWith('(prefers-color-scheme: dark)');
    });
  });

  describe('toggle', () => {
    it('should toggle from light to dark', () => {
      localStorageMock['app_theme'] = 'light';

      TestBed.configureTestingModule({});
      service = TestBed.inject(ThemeService);

      service.toggle();

      expect(service.theme()).toBe('dark');
    });

    it('should toggle from dark to light', () => {
      localStorageMock['app_theme'] = 'dark';

      TestBed.configureTestingModule({});
      service = TestBed.inject(ThemeService);

      service.toggle();

      expect(service.theme()).toBe('light');
    });

    it('should persist theme to localStorage after toggle', () => {
      TestBed.configureTestingModule({});
      service = TestBed.inject(ThemeService);

      service.toggle();

      // Flush the effects
      TestBed.tick();

      expect(localStorage.setItem).toHaveBeenCalledWith('app_theme', 'dark');
    });
  });

  describe('setTheme', () => {
    it('should set theme to dark', () => {
      TestBed.configureTestingModule({});
      service = TestBed.inject(ThemeService);

      service.setTheme('dark');

      expect(service.theme()).toBe('dark');
    });

    it('should set theme to light', () => {
      localStorageMock['app_theme'] = 'dark';

      TestBed.configureTestingModule({});
      service = TestBed.inject(ThemeService);

      service.setTheme('light');

      expect(service.theme()).toBe('light');
    });
  });

  describe('isDark', () => {
    it('should return true when theme is dark', () => {
      localStorageMock['app_theme'] = 'dark';

      TestBed.configureTestingModule({});
      service = TestBed.inject(ThemeService);

      expect(service.isDark()).toBe(true);
    });

    it('should return false when theme is light', () => {
      localStorageMock['app_theme'] = 'light';

      TestBed.configureTestingModule({});
      service = TestBed.inject(ThemeService);

      expect(service.isDark()).toBe(false);
    });
  });

  describe('DOM updates', () => {
    it('should add dark class when theme is dark', () => {
      localStorageMock['app_theme'] = 'dark';

      TestBed.configureTestingModule({});
      service = TestBed.inject(ThemeService);

      // Trigger effect by running change detection
      TestBed.tick();

      expect(document.documentElement.classList.add).toHaveBeenCalledWith('dark');
    });

    it('should remove dark class when theme is light', () => {
      localStorageMock['app_theme'] = 'light';

      TestBed.configureTestingModule({});
      service = TestBed.inject(ThemeService);

      // Trigger effect by running change detection
      TestBed.tick();

      expect(document.documentElement.classList.remove).toHaveBeenCalledWith('dark');
    });
  });
});

