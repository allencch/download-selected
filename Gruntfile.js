module.exports = grunt => {
  grunt.initConfig({
    watch: {
      ui: {
        files: ['src/ui/**/*.js'],
        tasks: ['concat']
      },
      background: {
        files: ['src/background/**/*.js'],
        tasks: ['concat']
      }
    },
    concat: {
      ui: {
        src: ['src/ui/lib/**/*.js', 'src/ui/index.js'],
        dest: 'src/ui.js'
      },
      background: {
        src: ['src/background/lib/**/*.js', 'src/background/index.js'],
        dest: 'src/background.js'
      }
    }
  });

  grunt.loadNpmTasks('grunt-contrib-watch');
  grunt.loadNpmTasks('grunt-contrib-concat');

  grunt.registerTask('default', ['watch']);
};
