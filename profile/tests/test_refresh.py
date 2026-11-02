import importlib.util
import json
from pathlib import Path
import tempfile
import unittest
from unittest.mock import patch

spec = importlib.util.spec_from_file_location('refresh', Path(__file__).parents[1] / 'refresh.py')
refresh = importlib.util.module_from_spec(spec)
spec.loader.exec_module(refresh)

class RefreshTests(unittest.TestCase):
    def test_total_uses_last_page_with_one_commit_per_page(self):
        self.assertEqual(refresh.history_total([{}], '<https://api.github.com/x?page=124&per_page=1>; rel="last"'), 124)
        self.assertEqual(refresh.history_total([{}], ''), 1)
        self.assertEqual(refresh.history_total([], ''), 0)

    def test_failed_fetch_preserves_last_good_snapshot(self):
        with tempfile.TemporaryDirectory() as d:
            root = Path(d)
            (root / 'profile').mkdir()
            path = root / 'profile/data.json'
            path.write_text('old data')
            with patch.object(refresh, 'ROOT', root), patch.object(refresh, 'NAMES', ['private']), patch.object(refresh, 'get', return_value=({'private': True}, '')):
                with self.assertRaises(RuntimeError):
                    refresh.refresh()
            self.assertEqual(path.read_text(), 'old data')

    def test_paginated_commits_are_complete_and_deduplicated(self):
        with tempfile.TemporaryDirectory() as d:
            root = Path(d)
            (root / 'profile').mkdir()
            commit = lambda i: {'sha': str(i), 'commit': {'committer': {'date': '2026-11-01T00:00:00Z'}}}
            replies = [({'full_name':'den9911/test','default_branch':'main','private':False}, ''),
                       ({'sha':'head','commit':{'tree':{'sha':'tree'}}}, ''),
                       ({'tree':[{'type':'blob','path':'src/main.rs','size':12}]}, ''),
                       ([commit(i) for i in range(100)], ''), ([commit(99),commit(100)], ''),
                       ([commit(100)], '<https://api.github.com/x?page=101>; rel="last"')]
            with patch.object(refresh, 'ROOT', root), patch.object(refresh, 'NAMES', ['test']), patch.object(refresh, 'get', side_effect=replies) as get, patch.object(refresh.subprocess, 'run'):
                refresh.refresh()
            data = json.loads((root / 'profile/data.json').read_text())
            repo = data['repositories']['test']
            self.assertEqual(len(repo['commits']), 101)
            self.assertEqual(repo['total_commits'], 101)
            self.assertTrue(any('page=2' in c.args[0] for c in get.call_args_list))

if __name__ == '__main__': unittest.main()
